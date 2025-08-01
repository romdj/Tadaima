/**
 * Application constants and configuration values
 */

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  FETCH_PROPERTIES_FAILED: 'Failed to fetch property data',
  INVALID_FILTERS: 'Invalid search filters provided',
  API_UNAVAILABLE: 'Property API is currently unavailable',
} as const;

export const PROPERTY_TYPES = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  VILLA: 'VILLA',
  TOWNHOUSE: 'TOWNHOUSE',
  STUDIO: 'STUDIO',
  COMMERCIAL: 'COMMERCIAL',
  LAND: 'LAND',
  OTHER: 'OTHER',
} as const;

export const LISTING_TYPES = {
  FOR_SALE: 'FOR_SALE',
  FOR_RENT: 'FOR_RENT',
  SHORT_TERM_RENTAL: 'SHORT_TERM_RENTAL',
} as const;