import { PropertyAggregator } from '../../services/PropertyAggregator.js';
import { PropertySearchFilters } from '../../types/Property.js';
import { logger } from '../../utils/logger.js';

const propertyAggregator = new PropertyAggregator();

export const propertyResolvers = {
  Query: {
    properties: async (_: unknown, { filters, page = 1, limit = 20, sortBy = 'dateAdded', sortOrder = 'DESC' }: {
      filters?: PropertySearchFilters;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }) => {
      logger.info({ filters, page, limit, sortBy, sortOrder }, 'Searching properties');
      
      try {
        const result = await propertyAggregator.search(filters || {}, page, limit);
        
        logger.info({ 
          totalCount: result.totalCount,
          returnedCount: result.properties.length,
          page,
          limit
        }, 'Property search completed');
        
        return result;
      } catch (error) {
        logger.error({ 
          filters, 
          page, 
          limit, 
          error: error instanceof Error ? error.message : String(error) 
        }, 'Property search failed');
        
        throw new Error('Failed to search properties');
      }
    },

    property: async (_: unknown, { id }: { id: string }) => {
      logger.info({ id }, 'Fetching single property');
      
      try {
        const property = await propertyAggregator.getProperty(id);
        
        if (!property) {
          logger.warn({ id }, 'Property not found');
          return null;
        }
        
        logger.info({ id, propertyTitle: property.title }, 'Property found');
        return property;
      } catch (error) {
        logger.error({ 
          id, 
          error: error instanceof Error ? error.message : String(error) 
        }, 'Failed to fetch property');
        
        throw new Error('Failed to fetch property');
      }
    },

    countries: async () => {
      const countries = [
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
        { code: 'ES', name: 'Spain', flag: '🇪🇸' },
        { code: 'IT', name: 'Italy', flag: '🇮🇹' },
        { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
        { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
        { code: 'NO', name: 'Norway', flag: '🇳🇴' },
        { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
        { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
        { code: 'PL', name: 'Poland', flag: '🇵🇱' },
        { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
        { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'FR', name: 'France', flag: '🇫🇷' },
        { code: 'GR', name: 'Greece', flag: '🇬🇷' },
        { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
        { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
        { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' }
      ];
      
      return countries;
    },

    propertySources: async () => {
      const sources = [
        {
          name: 'ImmoScout24',
          country: { code: 'DE', name: 'Germany', flag: '🇩🇪' },
          website: 'https://www.immobilienscout24.de',
          logoUrl: 'https://www.immobilienscout24.de/favicon.ico'
        },
        {
          name: 'Idealista',
          country: { code: 'ES', name: 'Spain', flag: '🇪🇸' },
          website: 'https://www.idealista.com',
          logoUrl: 'https://www.idealista.com/favicon.ico'
        },
        {
          name: 'Daft',
          country: { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
          website: 'https://www.daft.ie',
          logoUrl: 'https://www.daft.ie/favicon.ico'
        }
      ];
      
      return sources;
    },

    apiStatus: async () => {
      logger.info('Checking API status for all sources');
      
      try {
        const statuses = propertyAggregator.getApiStatus();
        
        logger.info({ 
          statusCount: statuses.length,
          onlineCount: statuses.filter(s => s.isOnline).length
        }, 'API status check completed');
        
        return statuses;
      } catch (error) {
        logger.error({ 
          error: error instanceof Error ? error.message : String(error) 
        }, 'Failed to get API status');
        
        throw new Error('Failed to get API status');
      }
    }
  },

  Mutation: {
    refreshPropertyData: async (_: unknown, { sourceId }: { sourceId?: string }) => {
      logger.info({ sourceId }, 'Refresh property data requested');
      
      // In a thin client architecture, this would typically clear any caches
      // For now, we'll just return true as there's no persistent data
      logger.info('Property data refresh completed (no-op in thin client)');
      return true;
    },

    syncProperty: async (_: unknown, { propertyId }: { propertyId: string }) => {
      logger.info({ propertyId }, 'Sync property requested');
      
      try {
        const property = await propertyAggregator.getProperty(propertyId);
        
        if (!property) {
          logger.warn({ propertyId }, 'Property not found for sync');
          return null;
        }
        
        logger.info({ propertyId, propertyTitle: property.title }, 'Property synced');
        return property;
      } catch (error) {
        logger.error({ 
          propertyId, 
          error: error instanceof Error ? error.message : String(error) 
        }, 'Failed to sync property');
        
        throw new Error('Failed to sync property');
      }
    }
  }
};