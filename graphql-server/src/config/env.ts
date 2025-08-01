/**
 * Server environment configuration with validation
 */

import dotenv from 'dotenv';
import { DEFAULT_PORTS } from '../constants/shared.js';

// Load environment variables from .env file
dotenv.config();

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CORS_ORIGIN: string;
  GRAPHQL_PLAYGROUND: boolean;
  
  // Property API Keys
  IMMOSCOUT24_API_KEY?: string;
  IDEALISTA_API_KEY?: string;
  IDEALISTA_API_SECRET?: string;
  DAFT_API_KEY?: string;
  FINN_API_KEY?: string;
  HEMNET_API_KEY?: string;
  IMMOWEB_API_KEY?: string;
  OTODOM_API_KEY?: string;
  INGATLAN_API_KEY?: string;
}

function validateEnv(): EnvConfig {
  const env = process.env;

  return {
    NODE_ENV: (env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(env.PORT || DEFAULT_PORTS.GRAPHQL_SERVER.toString(), 10),
    CORS_ORIGIN: env.CORS_ORIGIN || 'http://localhost:5173',
    GRAPHQL_PLAYGROUND: env.GRAPHQL_PLAYGROUND === 'true' || env.NODE_ENV === 'development',
    
    // Property API Keys
    IMMOSCOUT24_API_KEY: env.IMMOSCOUT24_API_KEY,
    IDEALISTA_API_KEY: env.IDEALISTA_API_KEY,
    IDEALISTA_API_SECRET: env.IDEALISTA_API_SECRET,
    DAFT_API_KEY: env.DAFT_API_KEY,
    FINN_API_KEY: env.FINN_API_KEY,
    HEMNET_API_KEY: env.HEMNET_API_KEY,
    IMMOWEB_API_KEY: env.IMMOWEB_API_KEY,
    OTODOM_API_KEY: env.OTODOM_API_KEY,
    INGATLAN_API_KEY: env.INGATLAN_API_KEY,
  };
}

export const config = validateEnv();

// Environment-specific configuration
export const envConfig = {
  development: {
    logLevel: 'debug',
    enableCors: true,
    enablePlayground: true,
    enableDevMode: true,
  },
  production: {
    logLevel: 'info',
    enableCors: false,
    enablePlayground: false,
    enableDevMode: false,
  },
  test: {
    logLevel: 'error',
    enableCors: true,
    enablePlayground: false,
    enableDevMode: false,
  }
}[config.NODE_ENV];

export default config;