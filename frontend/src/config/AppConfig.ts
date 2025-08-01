import { config as env } from './env';

/**
 * Application-wide configuration management
 * Centralizes all configuration values with type safety and validation
 */
export class AppConfig {
  private static instance: AppConfig;

  // API Configuration
  public readonly api = {
    graphqlEndpoint: env.GRAPHQL_URL,
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  };

  // UI Configuration
  public readonly ui = {
    animations: {
      fadeInDuration: 500,
      slideInDuration: 300,
      loaderSpinDuration: 1000,
    },
    table: {
      columnWidths: {
        propertyTitle: 'w-64',
        price: 'w-24',
        location: 'w-48',
        type: 'w-20',
        bedrooms: 'w-16',
        area: 'w-20',
      },
      rowsPerPage: 20,
      sortAnimationDuration: 200,
    },
    themes: {
      default: 'cupcake',
      dark: 'sunset',
      storageKey: 'tadaima-theme',
    },
  };

  // Property Search Configuration
  public readonly property = {
    search: {
      defaultSortKey: 'dateAdded',
      defaultSortOrder: 'desc' as const,
      defaultLimit: 20,
      maxLimit: 100,
    },
    filters: {
      minPrice: 0,
      maxPrice: 50000000, // 50M EUR
      defaultCountry: '',
    },
    map: {
      defaultZoom: 10,
      maxZoom: 18,
      minZoom: 3,
    },
  };

  // Performance Configuration
  public readonly performance = {
    cache: {
      searchTtlMs: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 50,
    },
    debounce: {
      searchMs: 300,
      resizeMs: 250,
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
  };

  // Development Configuration
  public readonly development = {
    logging: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
      enableConsole: env.NODE_ENV === 'development',
      enablePerformanceLogging: env.NODE_ENV === 'development',
    },
    features: {
      enableExperimentalFeatures: env.NODE_ENV === 'development',
      enableTestData: env.NODE_ENV === 'test',
    },
  };

  private constructor() {
    this.validateConfig();
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  /**
   * Validate configuration on initialization
   */
  private validateConfig(): void {
    if (!this.api.graphqlEndpoint) {
      throw new Error('GraphQL endpoint is required');
    }

    if (this.api.timeout <= 0) {
      throw new Error('API timeout must be positive');
    }

    if (this.property.search.defaultLimit <= 0) {
      throw new Error('Default search limit must be positive');
    }

    if (this.property.filters.maxPrice <= this.property.filters.minPrice) {
      throw new Error('Max price must be greater than min price');
    }
  }

  /**
   * Get configuration for a specific environment
   */
  public getEnvironmentConfig(): Record<string, unknown> {
    return {
      nodeEnv: env.NODE_ENV,
      apiEndpoint: this.api.graphqlEndpoint,
      isDevelopment: env.NODE_ENV === 'development',
      isProduction: env.NODE_ENV === 'production',
      isTest: env.NODE_ENV === 'test',
    };
  }

  /**
   * Get feature flags
   */
  public getFeatureFlags(): Record<string, boolean> {
    return {
      enableDarkMode: true,
      enableAnimations: true,
      enableAdvancedSorting: true,
      enableMapView: true,
      enableSavedSearches: this.development.features.enableExperimentalFeatures,
      enableTestData: this.development.features.enableTestData,
    };
  }

  /**
   * Override configuration for testing
   */
  public static createTestConfig(overrides: Partial<Record<string, unknown>> = {}): AppConfig {
    const config = new AppConfig();
    Object.assign(config, overrides);
    return config;
  }
}