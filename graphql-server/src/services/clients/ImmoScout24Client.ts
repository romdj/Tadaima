import got from 'got';
import { Property, PropertySearchFilters, PropertyType, ListingType } from '../../types/Property.js';
import { PropertyClient } from '../PropertyAggregator.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class ImmoScout24Client implements PropertyClient {
  name = 'ImmoScout24';
  country = 'DE';
  private baseUrl = 'https://rest.immobilienscout24.de/restapi/api/search/v1.0';
  private apiKey = config.IMMOSCOUT24_API_KEY;

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(filters: PropertySearchFilters, page: number, limit: number): Promise<Property[]> {
    if (!this.isAvailable()) {
      logger.warn('ImmoScout24 API key not configured');
      return [];
    }

    try {
      const queryParams = this.buildSearchParams(filters, page, limit);
      const url = `${this.baseUrl}/search/region?${queryParams}`;
      
      const response = await got(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: { request: 10000 }
      }).json() as any;

      return this.normalizeProperties(response);
    } catch (error) {
      logger.error('ImmoScout24 search error:', error);
      return [];
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/expose/${id}`;
      
      const response = await got(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: { request: 10000 }
      }).json() as any;

      const normalized = this.normalizeProperties({ resultlistEntries: [{ resultlistEntry: response }] });
      return normalized[0] || null;
    } catch (error) {
      logger.error(`ImmoScout24 getProperty error for ID ${id}:`, error);
      return null;
    }
  }

  private buildSearchParams(filters: PropertySearchFilters, page: number, limit: number): string {
    const params = new URLSearchParams();
    
    // Basic pagination
    params.set('pagenumber', page.toString());
    params.set('pagesize', Math.min(limit, 100).toString()); // ImmoScout24 max is 100
    
    // Price filters
    if (filters.minPrice) params.set('price', `${filters.minPrice}-`);
    if (filters.maxPrice) params.set('price', `${filters.minPrice || 0}-${filters.maxPrice}`);
    
    // Property type mapping
    if (filters.propertyType) {
      const typeMapping: Record<PropertyType, string> = {
        [PropertyType.APARTMENT]: 'apartment',
        [PropertyType.HOUSE]: 'house',
        [PropertyType.VILLA]: 'house',
        [PropertyType.TOWNHOUSE]: 'house',
        [PropertyType.STUDIO]: 'apartment',
        [PropertyType.COMMERCIAL]: 'office',
        [PropertyType.LAND]: 'plot',
        [PropertyType.OTHER]: 'apartment'
      };
      params.set('realestatetype', typeMapping[filters.propertyType]);
    }
    
    // Listing type (rent vs buy)
    if (filters.listingType) {
      const listingMapping: Record<ListingType, string> = {
        [ListingType.FOR_SALE]: 'buy',
        [ListingType.FOR_RENT]: 'rent',
        [ListingType.SHORT_TERM_RENTAL]: 'rent'
      };
      params.set('channel', listingMapping[filters.listingType]);
    }
    
    // Room filters
    if (filters.minBedrooms) params.set('numberofrooms', `${filters.minBedrooms}-`);
    if (filters.maxBedrooms) params.set('numberofrooms', `${filters.minBedrooms || 1}-${filters.maxBedrooms}`);
    
    // Area filters
    if (filters.minArea) params.set('livingspace', `${filters.minArea}-`);
    if (filters.maxArea) params.set('livingspace', `${filters.minArea || 0}-${filters.maxArea}`);
    
    // Location (ImmoScout24 uses region IDs, this is simplified)
    if (filters.city) {
      params.set('geocodes', '1276'); // Default to Berlin, would need proper geocoding
    }
    
    return params.toString();
  }

  private normalizeProperties(response: any): Property[] {
    if (!response?.resultlistEntries?.[0]?.resultlistEntry) {
      return [];
    }

    const entries = Array.isArray(response.resultlistEntries[0].resultlistEntry) 
      ? response.resultlistEntries[0].resultlistEntry 
      : [response.resultlistEntries[0].resultlistEntry];

    return entries.map((entry: any) => this.normalizeProperty(entry));
  }

  private normalizeProperty(entry: any): Property {
    const realEstate = entry.resultlistEntry?.realEstate || entry.realEstate || entry;
    
    return {
      id: `immoscout24_${realEstate['@id'] || realEstate.id}`,
      title: realEstate.title || 'Property in Germany',
      description: realEstate.descriptionNote || '',
      price: parseFloat(realEstate.price?.value || realEstate.rentPrice?.value || '0'),
      currency: realEstate.price?.currency || realEstate.rentPrice?.currency || 'EUR',
      propertyType: this.mapPropertyType(realEstate['@xsi.type']),
      listingType: realEstate.marketingType === 'RENT' ? ListingType.FOR_RENT : ListingType.FOR_SALE,
      bedrooms: parseInt(realEstate.numberOfRooms || '0'),
      bathrooms: parseInt(realEstate.numberOfBathRooms || '0'),
      area: parseFloat(realEstate.livingSpace || '0'),
      areaUnit: 'm²',
      address: {
        street: realEstate.address?.street,
        city: realEstate.address?.city || 'Germany',
        region: realEstate.address?.quarter,
        postalCode: realEstate.address?.postcode,
        country: 'Germany'
      },
      coordinates: realEstate.address?.wgs84Coordinate ? {
        latitude: parseFloat(realEstate.address.wgs84Coordinate.latitude),
        longitude: parseFloat(realEstate.address.wgs84Coordinate.longitude)
      } : undefined,
      images: this.extractImages(realEstate.attachments),
      source: {
        name: 'ImmoScout24',
        country: { code: 'DE', name: 'Germany', flag: '🇩🇪' },
        website: 'https://www.immobilienscout24.de',
        logoUrl: 'https://www.immobilienscout24.de/favicon.ico'
      },
      url: `https://www.immobilienscout24.de/expose/${realEstate['@id'] || realEstate.id}`,
      dateAdded: new Date().toISOString(), // ImmoScout24 doesn't provide this directly
      features: this.extractFeatures(realEstate),
      energyClass: realEstate.energyEfficiencyClass || undefined,
      isActive: true
    };
  }

  private mapPropertyType(xsiType: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      'common:Apartment': PropertyType.APARTMENT,
      'common:House': PropertyType.HOUSE,
      'common:HouseBuy': PropertyType.HOUSE,
      'common:HouseRent': PropertyType.HOUSE,
      'common:CompulsoryAuction': PropertyType.OTHER,
      'common:Plot': PropertyType.LAND,
      'common:OfficeRent': PropertyType.COMMERCIAL,
      'common:OfficeBuy': PropertyType.COMMERCIAL
    };
    
    return typeMap[xsiType] || PropertyType.OTHER;
  }

  private extractImages(attachments: any): string[] {
    if (!attachments?.attachment) return [];
    
    const attachmentList = Array.isArray(attachments.attachment) 
      ? attachments.attachment 
      : [attachments.attachment];
    
    return attachmentList
      .filter((att: any) => att['@xsi.type'] === 'common:Picture')
      .map((att: any) => att.urls?.[0]?.url?.href)
      .filter(Boolean)
      .slice(0, 10); // Limit to 10 images
  }

  private extractFeatures(realEstate: any): string[] {
    const features: string[] = [];
    
    if (realEstate.balcony) features.push('Balcony');
    if (realEstate.garden) features.push('Garden');
    if (realEstate.lift) features.push('Elevator');
    if (realEstate.builtInKitchen) features.push('Built-in Kitchen');
    if (realEstate.cellar) features.push('Cellar');
    if (realEstate.handicappedAccessible) features.push('Handicapped Accessible');
    
    return features;
  }
}