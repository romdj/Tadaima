import { Property, PropertySearchFilters, PropertySearchResult } from '../types/Property.js';
import { ImmoScout24Client } from './clients/ImmoScout24Client.js';
import { IdealistaClient } from './clients/IdealistaClient.js';
import { DaftClient } from './clients/DaftClient.js';
import { logger } from '../utils/logger.js';

export interface PropertyClient {
  name: string;
  country: string;
  isAvailable(): boolean;
  search(filters: PropertySearchFilters, page: number, limit: number): Promise<Property[]>;
  getProperty(id: string): Promise<Property | null>;
}

export class PropertyAggregator {
  private clients: PropertyClient[] = [];

  constructor() {
    // Initialize available API clients
    this.clients = [
      new ImmoScout24Client(),
      new IdealistaClient(),
      new DaftClient(),
      // Add more clients as we implement them
    ];
  }

  async search(filters: PropertySearchFilters, page: number = 1, limit: number = 20): Promise<PropertySearchResult> {
    const relevantClients = this.getRelevantClients(filters);
    
    logger.info(`Searching with ${relevantClients.length} clients for filters:`, filters);

    // Execute searches in parallel
    const searchPromises = relevantClients.map(async (client) => {
      try {
        const results = await client.search(filters, page, limit);
        logger.info(`${client.name}: Found ${results.length} properties`);
        return results;
      } catch (error) {
        logger.error(`${client.name} search failed:`, error);
        return [];
      }
    });

    const allResults = await Promise.all(searchPromises);
    const properties = allResults.flat();

    // Remove duplicates based on URL (properties might appear on multiple sites)
    const uniqueProperties = this.deduplicateProperties(properties);

    // Sort by date added (newest first)
    uniqueProperties.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

    // Apply pagination
    const totalCount = uniqueProperties.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = uniqueProperties.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties,
      totalCount,
      hasNextPage: endIndex < totalCount,
      hasPreviousPage: page > 1
    };
  }

  async getProperty(id: string): Promise<Property | null> {
    // Try to find the property from any of the clients
    for (const client of this.clients) {
      try {
        const property = await client.getProperty(id);
        if (property) {
          return property;
        }
      } catch (error) {
        logger.error(`${client.name} getProperty failed for ID ${id}:`, error);
      }
    }
    return null;
  }

  getApiStatus() {
    return this.clients.map(client => ({
      source: client.name,
      isOnline: client.isAvailable(),
      lastChecked: new Date().toISOString(),
      rateLimitRemaining: null,
      rateLimitReset: null
    }));
  }

  private getRelevantClients(filters: PropertySearchFilters): PropertyClient[] {
    // Filter clients based on country if specified
    if (filters.country) {
      const countryCode = filters.country.toUpperCase();
      return this.clients.filter(client => 
        client.isAvailable() && 
        (client.country === countryCode || this.clientSupportsCountry(client, countryCode))
      );
    }

    // Return all available clients if no country filter
    return this.clients.filter(client => client.isAvailable());
  }

  private clientSupportsCountry(client: PropertyClient, countryCode: string): boolean {
    // Map clients to supported countries
    const clientCountryMap: Record<string, string[]> = {
      'ImmoScout24': ['DE'],
      'Idealista': ['ES', 'IT', 'PT'],
      'Daft': ['IE'],
      'FINN': ['NO'],
      'Hemnet': ['SE'],
      'Immoweb': ['BE'],
      'Otodom': ['PL'],
      'Ingatlan': ['HU']
    };

    const supportedCountries = clientCountryMap[client.name] || [];
    return supportedCountries.includes(countryCode);
  }

  private deduplicateProperties(properties: Property[]): Property[] {
    const seen = new Set<string>();
    return properties.filter(property => {
      // Use URL as deduplication key (properties might have same URL on different sites)
      const key = property.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}