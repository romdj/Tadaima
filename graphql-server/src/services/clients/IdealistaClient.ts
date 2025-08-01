import got from 'got';
import { Property, PropertySearchFilters, PropertyType, ListingType } from '../../types/Property.js';
import { PropertyClient } from '../PropertyAggregator.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class IdealistaClient implements PropertyClient {
  name = 'Idealista';
  country = 'ES'; // Also supports IT, PT
  private baseUrl = 'https://api.idealista.com/3.5';
  private apiKey = config.IDEALISTA_API_KEY;
  private apiSecret = config.IDEALISTA_API_SECRET;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  isAvailable(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  async search(filters: PropertySearchFilters, page: number, limit: number): Promise<Property[]> {
    if (!this.isAvailable()) {
      logger.warn('Idealista API credentials not configured');
      return [];
    }

    try {
      await this.ensureValidToken();
      
      const queryParams = this.buildSearchParams(filters, page, limit);
      const country = this.getCountryFromFilters(filters);
      const url = `${this.baseUrl}/${country}/search`;
      
      const response = await got.post(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: queryParams,
        timeout: { request: 10000 }
      }).json() as any;

      return this.normalizeProperties(response, country);
    } catch (error) {
      logger.error('Idealista search error:', error);
      return [];
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      await this.ensureValidToken();
      
      // Extract country and property ID from our composite ID
      const [, country, propertyId] = id.split('_');
      const url = `${this.baseUrl}/${country}/detail`;
      
      const response = await got.post(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: { propertyCode: propertyId },
        timeout: { request: 10000 }
      }).json() as any;

      if (response.elementList?.[0]) {
        return this.normalizeProperty(response.elementList[0], country);
      }
      return null;
    } catch (error) {
      logger.error(`Idealista getProperty error for ID ${id}:`, error);
      return null;
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return; // Token still valid
    }

    try {
      const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
      
      const response = await got.post('https://api.idealista.com/oauth/token', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          grant_type: 'client_credentials',
          scope: 'read'
        }
      }).json() as any;

      this.accessToken = response.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.expires_in * 1000));
      
      logger.info('Idealista access token refreshed');
    } catch (error) {
      logger.error('Failed to get Idealista access token:', error);
      throw error;
    }
  }

  private getCountryFromFilters(filters: PropertySearchFilters): string {
    const countryMap: Record<string, string> = {
      'ES': 'es',
      'IT': 'it', 
      'PT': 'pt'
    };
    
    return countryMap[filters.country?.toUpperCase() || 'ES'] || 'es';
  }

  private buildSearchParams(filters: PropertySearchFilters, page: number, limit: number): Record<string, any> {
    const params: Record<string, any> = {
      maxItems: Math.min(limit, 50), // Idealista max is 50
      numPage: page,
      order: 'publicationDate'
    };
    
    // Location - simplified, would need proper location mapping
    if (filters.city) {
      params.center = filters.city;
      params.distance = 20000; // 20km radius
    } else {
      params.locationId = '0-EU-ES'; // Default to Spain
    }
    
    // Price filters
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    
    // Property type
    if (filters.propertyType) {
      params.propertyType = this.mapPropertyType(filters.propertyType);
    }
    
    // Listing type
    if (filters.listingType) {
      params.operation = filters.listingType === ListingType.FOR_SALE ? 'sale' : 'rent';
    }
    
    // Bedrooms
    if (filters.minBedrooms) params.minRooms = filters.minBedrooms;
    if (filters.maxBedrooms) params.maxRooms = filters.maxBedrooms;
    
    // Area
    if (filters.minArea) params.minSize = filters.minArea;
    if (filters.maxArea) params.maxSize = filters.maxArea;
    
    return params;
  }

  private mapPropertyType(type: PropertyType): string {
    const typeMap: Record<PropertyType, string> = {
      [PropertyType.APARTMENT]: 'flat',
      [PropertyType.HOUSE]: 'chalet',
      [PropertyType.VILLA]: 'chalet',
      [PropertyType.TOWNHOUSE]: 'duplex',
      [PropertyType.STUDIO]: 'studio',
      [PropertyType.COMMERCIAL]: 'office',
      [PropertyType.LAND]: 'land',
      [PropertyType.OTHER]: 'flat'
    };
    
    return typeMap[type] || 'flat';
  }

  private normalizeProperties(response: any, country: string): Property[] {
    if (!response?.elementList) {
      return [];
    }

    return response.elementList.map((element: any) => this.normalizeProperty(element, country));
  }

  private normalizeProperty(element: any, country: string): Property {
    const countryNames = { es: 'Spain', it: 'Italy', pt: 'Portugal' };
    const countryFlags = { es: '🇪🇸', it: '🇮🇹', pt: '🇵🇹' };
    
    return {
      id: `idealista_${country}_${element.propertyCode}`,
      title: element.address || `Property in ${countryNames[country as keyof typeof countryNames]}`,
      description: element.description || '',
      price: element.price || 0,
      currency: 'EUR',
      propertyType: this.reverseMapPropertyType(element.propertyType),
      listingType: element.operation === 'sale' ? ListingType.FOR_SALE : ListingType.FOR_RENT,
      bedrooms: element.rooms || undefined,
      bathrooms: element.bathrooms || undefined,
      area: element.size || undefined,
      areaUnit: 'm²',
      address: {
        street: element.address,
        city: element.municipality || countryNames[country as keyof typeof countryNames],
        region: element.province,
        postalCode: undefined,
        country: countryNames[country as keyof typeof countryNames] || 'Spain'
      },
      coordinates: element.latitude && element.longitude ? {
        latitude: parseFloat(element.latitude),
        longitude: parseFloat(element.longitude)
      } : undefined,
      images: this.extractImages(element),
      source: {
        name: 'Idealista',
        country: { 
          code: country.toUpperCase(), 
          name: countryNames[country as keyof typeof countryNames] || 'Spain',
          flag: countryFlags[country as keyof typeof countryFlags] || '🇪🇸'
        },
        website: `https://www.idealista.com`,
        logoUrl: 'https://www.idealista.com/favicon.ico'
      },
      url: element.url || `https://www.idealista.com/inmueble/${element.propertyCode}`,
      dateAdded: new Date().toISOString(),
      features: this.extractFeatures(element),
      energyClass: element.energyCertification?.energyConsumption?.type,
      isActive: true
    };
  }

  private reverseMapPropertyType(idealistaType: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      'flat': PropertyType.APARTMENT,
      'chalet': PropertyType.HOUSE,
      'duplex': PropertyType.TOWNHOUSE,
      'studio': PropertyType.STUDIO,
      'office': PropertyType.COMMERCIAL,
      'land': PropertyType.LAND,
      'garage': PropertyType.OTHER,
      'storage': PropertyType.OTHER
    };
    
    return typeMap[idealistaType] || PropertyType.OTHER;
  }

  private extractImages(element: any): string[] {
    if (!element.multimedia?.images) return [];
    
    return element.multimedia.images
      .map((img: any) => img.url)
      .filter(Boolean)
      .slice(0, 10);
  }

  private extractFeatures(element: any): string[] {
    const features: string[] = [];
    
    if (element.hasVideo) features.push('Video Tour');
    if (element.has3DTour) features.push('3D Tour');
    if (element.hasPlan) features.push('Floor Plan');
    if (element.parkingSpace?.hasParkingSpace) features.push('Parking');
    if (element.exterior) features.push('Exterior');
    
    // Add energy certification as feature
    if (element.energyCertification?.energyConsumption?.type) {
      features.push(`Energy Class ${element.energyCertification.energyConsumption.type}`);
    }
    
    return features;
  }
}