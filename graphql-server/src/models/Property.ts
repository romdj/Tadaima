import { ObjectId } from 'mongodb';

export interface Property {
  _id?: ObjectId;
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  address: Address;
  coordinates?: Coordinates;
  images: string[];
  source: PropertySource;
  url: string;
  dateAdded: Date;
  dateUpdated?: Date;
  features: string[];
  energyClass?: string;
  isActive: boolean;
  sourceId: string; // External ID from the source API
  lastSynced: Date;
}

export interface Address {
  street?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PropertySource {
  name: string;
  country: Country;
  website: string;
  logoUrl?: string;
}

export interface Country {
  code: string;
  name: string;
  flag?: string;
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  TOWNHOUSE = 'TOWNHOUSE',
  STUDIO = 'STUDIO',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  OTHER = 'OTHER'
}

export enum ListingType {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
  SHORT_TERM_RENTAL = 'SHORT_TERM_RENTAL'
}

export interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  country?: string;
  city?: string;
  region?: string;
}

export interface ApiStatus {
  source: string;
  isOnline: boolean;
  lastChecked: Date;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}