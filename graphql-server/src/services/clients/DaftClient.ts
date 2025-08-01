import got from 'got';
import { Property, PropertySearchFilters, PropertyType, ListingType } from '../../types/Property.js';
import { PropertyClient } from '../PropertyAggregator.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class DaftClient implements PropertyClient {
  name = 'Daft';
  country = 'IE';
  private baseUrl = 'https://api.daft.ie/v3';
  private apiKey = config.DAFT_API_KEY;

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(filters: PropertySearchFilters, page: number, limit: number): Promise<Property[]> {
    if (!this.isAvailable()) {
      logger.warn('Daft API key not configured');
      return [];
    }

    try {
      const searchParams = this.buildSearchParams(filters, page, limit);
      const url = `${this.baseUrl}/search`;
      
      const response = await got.post(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'EuroImmo/1.0'
        },
        form: {
          api_key: this.apiKey,
          ...searchParams
        },
        timeout: { request: 10000 }
      }).json() as any;

      return this.normalizeProperties(response);
    } catch (error) {
      logger.error('Daft search error:', error);
      return [];
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // Extract Daft property ID from our composite ID
      const daftId = id.replace('daft_', '');
      const url = `${this.baseUrl}/property`;
      
      const response = await got.post(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'EuroImmo/1.0'
        },
        form: {
          api_key: this.apiKey,
          id: daftId
        },
        timeout: { request: 10000 }
      }).json() as any;

      if (response.property) {
        return this.normalizeProperty(response.property);
      }
      return null;
    } catch (error) {
      logger.error(`Daft getProperty error for ID ${id}:`, error);
      return null;
    }
  }

  private buildSearchParams(filters: PropertySearchFilters, page: number, limit: number): Record<string, any> {
    const params: Record<string, any> = {
      offset: (page - 1) * limit,
      limit: Math.min(limit, 20) // Daft typical limit
    };
    
    // Property type and listing type combined
    if (filters.listingType === ListingType.FOR_SALE) {
      params.section = 'residential-for-sale';
    } else if (filters.listingType === ListingType.FOR_RENT) {
      params.section = 'residential-to-let';
    } else {
      params.section = 'residential-for-sale'; // Default
    }
    
    // Price filters
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;
    
    // Property type
    if (filters.propertyType) {
      params.property_type = this.mapPropertyType(filters.propertyType);
    }
    
    // Bedrooms
    if (filters.minBedrooms) params.min_beds = filters.minBedrooms;
    if (filters.maxBedrooms) params.max_beds = filters.maxBedrooms;
    
    // Bathrooms
    if (filters.minBathrooms) params.min_baths = filters.minBathrooms;
    if (filters.maxBathrooms) params.max_baths = filters.maxBathrooms;
    
    // Location
    if (filters.city) {
      // Daft uses area codes - this is simplified
      const areaMapping: Record<string, string> = {
        'dublin': 'dublin',
        'cork': 'cork',
        'galway': 'galway',
        'limerick': 'limerick',
        'waterford': 'waterford'
      };
      params.area = areaMapping[filters.city.toLowerCase()] || 'dublin';
    }
    
    return params;
  }

  private mapPropertyType(type: PropertyType): string {
    const typeMap: Record<PropertyType, string> = {
      [PropertyType.APARTMENT]: 'apartment',
      [PropertyType.HOUSE]: 'house',
      [PropertyType.VILLA]: 'house',
      [PropertyType.TOWNHOUSE]: 'house',
      [PropertyType.STUDIO]: 'studio',
      [PropertyType.COMMERCIAL]: 'commercial',
      [PropertyType.LAND]: 'site',
      [PropertyType.OTHER]: 'house'
    };
    
    return typeMap[type] || 'house';
  }

  private normalizeProperties(response: any): Property[] {
    if (!response?.properties) {
      return [];
    }

    const properties = Array.isArray(response.properties) 
      ? response.properties 
      : [response.properties];

    return properties.map((prop: any) => this.normalizeProperty(prop));
  }

  private normalizeProperty(prop: any): Property {
    return {
      id: `daft_${prop.id}`,
      title: prop.title || prop.address || 'Property in Ireland',
      description: prop.description || '',
      price: parseFloat(prop.price || '0'),
      currency: 'EUR',
      propertyType: this.reverseMapPropertyType(prop.property_type),
      listingType: prop.section?.includes('sale') ? ListingType.FOR_SALE : ListingType.FOR_RENT,
      bedrooms: parseInt(prop.bedrooms || prop.beds || '0') || undefined,
      bathrooms: parseInt(prop.bathrooms || prop.baths || '0') || undefined,
      area: parseFloat(prop.size || '0') || undefined,
      areaUnit: prop.size_type === 'acres' ? 'acres' : 'm²',
      address: {
        street: prop.street,
        city: prop.area || prop.county || 'Dublin',
        region: prop.county,
        postalCode: prop.eircode,
        country: 'Ireland'
      },
      coordinates: prop.latitude && prop.longitude ? {
        latitude: parseFloat(prop.latitude),
        longitude: parseFloat(prop.longitude)
      } : undefined,
      images: this.extractImages(prop),
      source: {
        name: 'Daft',
        country: { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
        website: 'https://www.daft.ie',
        logoUrl: 'https://www.daft.ie/favicon.ico'
      },
      url: prop.daft_url || prop.url || `https://www.daft.ie/property/${prop.id}`,
      dateAdded: prop.date_entered || new Date().toISOString(),
      dateUpdated: prop.date_updated,
      features: this.extractFeatures(prop),
      energyClass: prop.ber_rating,
      isActive: true
    };
  }

  private reverseMapPropertyType(daftType: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      'apartment': PropertyType.APARTMENT,
      'house': PropertyType.HOUSE,
      'studio': PropertyType.STUDIO,
      'commercial': PropertyType.COMMERCIAL,
      'site': PropertyType.LAND,
      'duplex': PropertyType.TOWNHOUSE
    };
    
    return typeMap[daftType] || PropertyType.OTHER;
  }

  private extractImages(prop: any): string[] {
    const images: string[] = [];
    
    // Daft provides various image formats
    if (prop.images) {
      const imageList = Array.isArray(prop.images) ? prop.images : [prop.images];
      images.push(...imageList.map((img: any) => img.url || img).filter(Boolean));
    }
    
    if (prop.main_photo) {
      images.unshift(prop.main_photo); // Add main photo first
    }
    
    return [...new Set(images)].slice(0, 10); // Remove duplicates and limit
  }

  private extractFeatures(prop: any): string[] {
    const features: string[] = [];
    
    // Property features
    if (prop.garage) features.push('Garage');
    if (prop.garden) features.push('Garden');
    if (prop.parking) features.push('Parking');
    if (prop.alarm) features.push('Alarm');
    if (prop.cable_tv) features.push('Cable TV');
    if (prop.dish_washer) features.push('Dishwasher');
    if (prop.dryer) features.push('Dryer');
    if (prop.washing_machine) features.push('Washing Machine');
    
    // Property type specific features
    if (prop.furnished === 'furnished') features.push('Furnished');
    if (prop.furnished === 'part_furnished') features.push('Part Furnished');
    
    // BER rating as feature
    if (prop.ber_rating) {
      features.push(`BER Rating: ${prop.ber_rating}`);
    }
    
    return features;
  }
}