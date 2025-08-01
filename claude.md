# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tadaima - European Property Search Aggregator

## Project Overview
This is a modern property search aggregator called "Tadaima" (Japanese for "I'm home") that searches across multiple European real estate portals in real-time. Built with a thin client architecture - no data storage, just real-time API aggregation.

**Current Status**: The project appears to be in early development with basic GraphQL server and Svelte frontend setup.

## Architecture
- **Monorepo Structure**: Uses npm workspaces with 3 main packages
- **Backend**: GraphQL server using Fastify + Mercurius
- **Frontend**: SvelteKit application with TypeScript
- **Shared**: Common types and configuration
- **Data Flow**: Real-time API aggregation (no database persistence)

## Key Commands

### Root Level (Monorepo Commands)
- `npm run install:all`: Install dependencies for all workspaces
- `npm run build`: Build server and frontend
- `npm run dev`: Start GraphQL server only
- `npm run dev:frontend`: Start Svelte frontend
- `npm run test`: Run tests for all workspaces
- `npm run lint`: Run ESLint on all workspaces
- `npm run check`: Run TypeScript checks on all workspaces
- `npm run complete-build`: Full clean build with tests
- `npm run health`: Health check the running server
- `npm run docker:dev`: Start development environment with Docker

### GraphQL Server (`graphql-server/`)
- `npm start`: Start server with tsx
- `npm run dev`: Start with nodemon for development
- `npm run build`: Compile TypeScript
- `npm test`: Run Jest tests
- `npm run test:coverage`: Run tests with coverage
- `npm run lint`: ESLint on TypeScript files
- `npm run check`: TypeScript type checking

### Frontend (`frontend/`)
- `npm run dev`: Start Vite development server
- `npm run build`: Build for production
- `npm run check`: Run svelte-check with TypeScript
- `npm test`: Run Vitest tests
- `npm run test:coverage`: Run tests with coverage
- `npm run lint`: ESLint on frontend code

## Directory Structure
```
tadaima/
├── graphql-server/          # GraphQL API server
│   ├── src/
│   │   ├── server.ts        # Fastify server setup
│   │   ├── graphql/         # GraphQL schemas and resolvers
│   │   ├── services/        # Property aggregation services
│   │   ├── models/          # TypeScript models
│   │   └── utils/           # Utilities and logging
├── frontend/                # SvelteKit application
│   ├── src/
│   │   ├── routes/          # SvelteKit routes
│   │   ├── components/      # Svelte components
│   │   ├── stores/          # Svelte stores
│   │   └── utils/           # Frontend utilities
├── shared/                  # Shared configuration
└── .env.example            # Environment variables template
```

## Tech Stack Details
- **Backend**: TypeScript, Fastify, Mercurius GraphQL, Got (HTTP client)
- **Frontend**: SvelteKit, TypeScript, TailwindCSS, DaisyUI, URQL GraphQL client
- **Testing**: Jest for backend, Vitest for frontend
- **Build Tools**: Vite, TypeScript compiler, tsx for development
- **Styling**: TailwindCSS with DaisyUI components

## Development Setup

1. **Environment Configuration**: Copy `.env.example` to `.env` and configure API keys for European property portals
2. **Install Dependencies**: `npm run install:all`
3. **Development**: Run `npm run dev` (server) and `npm run dev:frontend` (client) in separate terminals
4. **Access Points**:
   - GraphQL Playground: http://localhost:4000
   - Frontend Application: http://localhost:5173
   - Health Check: http://localhost:4000/health

## Property Portal Integrations
The system is designed to aggregate from 8+ European property portals:
- ImmoScout24 (Germany)
- Idealista (Spain, Italy, Portugal)
- Daft (Ireland)
- FINN.no (Norway)
- Hemnet (Sweden)
- Immoweb (Belgium)
- Otodom (Poland)
- Ingatlan (Hungary)

## Key Features
- Multi-country property search across Europe
- Real-time API aggregation (no data persistence)
- GraphQL API with comprehensive property schema
- Modern responsive UI with theme support
- Property deduplication and normalization
- CORS-enabled for cross-origin requests

## Important Notes
- **No Database**: This is a thin client that aggregates APIs in real-time
- **API Keys Required**: Each property portal requires API keys configured in `.env`
- **CORS Configuration**: Server supports configurable CORS origins for development/production
- **Workspace Structure**: Uses npm workspaces - always run commands from appropriate workspace or use root-level aggregate commands
- **Testing**: Both Jest (backend) and Vitest (frontend) are configured
- **Type Safety**: Full TypeScript coverage across the stack