# Tadaima 🏠

**Your European Home Finder**

A modern property search aggregator that searches across multiple European real estate portals in real-time. Built with GraphQL, Svelte, and a thin client architecture.

## What is Tadaima?

"Tadaima" (ただいま) is Japanese for "I'm home" - the perfect name for a service that helps you find your next home across Europe.

## Features

- 🌍 **Multi-country search** - Search properties across 30+ European countries
- ⚡ **Real-time results** - Live data from multiple property portals
- 🎯 **Smart aggregation** - Deduplicates and normalizes results
- 🚀 **Fast & modern** - Built with GraphQL and Svelte
- 📱 **Responsive design** - Works on all devices

## Supported Property Portals

### Active APIs (8 sources)
- **ImmoScout24** (Germany) 🇩🇪

### Planned Integrations
- **Idealista** (Spain, Italy, Portugal) 🇪🇸🇮🇹🇵🇹
- **Daft** (Ireland) 🇮🇪
- **FINN.no** (Norway) 🇳🇴
- **Hemnet** (Sweden) 🇸🇪
- **Immoweb** (Belgium) 🇧🇪
- **Otodom** (Poland) 🇵🇱
- **Ingatlan** (Hungary) 🇭🇺
- Rightmove (UK), Funda (Netherlands), SeLoger (France), and more

## Architecture

**Thin Client Approach** - No data storage, real-time API aggregation:
- **GraphQL Server** - Aggregates multiple property APIs in parallel
- **Svelte Frontend** - Modern, fast, reactive UI
- **TypeScript** - Full type safety across the stack

## Quick Start

### Prerequisites
- Node.js 18+
- API keys from property portals (see `.env.example`)

### Development Setup

```bash
# Clone and install
npm run install:all

# Start development servers
npm run dev              # Starts GraphQL server
npm run dev:frontend     # Starts Svelte frontend (separate terminal)

# Or use Docker
npm run docker:dev
```

### Environment Configuration

Copy `.env.example` to `.env` and add your API keys:

```bash
# Get API keys from:
IMMOSCOUT24_API_KEY=     # https://api.immobilienscout24.de/
IDEALISTA_API_KEY=       # https://developers.idealista.com/
DAFT_API_KEY=           # https://api.daft.ie/doc/v3/
# ... etc
```

## Usage

### GraphQL Playground
Visit `http://localhost:4000` for the GraphQL playground.

### Example Queries

```graphql
# Search properties
query SearchProperties {
  properties(
    filters: {
      country: "DE",
      minPrice: 200000,
      maxPrice: 500000,
      propertyType: APARTMENT
    }
    page: 1, limit: 10
  ) {
    totalCount
    properties {
      id, title, price, currency
      address { city, country }
      source { name }
      url
    }
  }
}

# Get countries & API status
query Metadata {
  countries { code, name, flag }
  apiStatus { source, isOnline }
}
```

### Frontend
Visit `http://localhost:5173` for the Svelte application.

## Development

### Scripts
```bash
npm run build           # Build all packages
npm run test           # Run all tests
npm run lint           # Lint all packages
npm run check          # TypeScript checks
npm run health         # Health check server
```

### Project Structure
```
tadaima/
├── graphql-server/    # GraphQL API aggregator
├── frontend/          # Svelte application
├── shared/           # Shared types & config
└── docs/            # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Deployment

### Docker
```bash
npm run docker:build
npm run docker:up
```

### Manual
```bash
npm run build
npm start
```

## API Documentation

See `/docs` for detailed API documentation and integration guides.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Issues: [GitHub Issues](https://github.com/romdj/tadaima/issues)
- 📚 Docs: [Documentation](/docs)

---

**Tadaima** - Find your home across Europe 🏠✨
