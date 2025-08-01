# European Property API Research Results

## ✅ APIs Available with Documentation

### 1. **ImmoScout24.de (Germany)**
- **API Available**: ✅ Yes - Comprehensive public API
- **Documentation URL**: https://api.immobilienscout24.de/
- **Authentication**: OAuth (Three-Legged, Two-Legged, Personal Access Token)
- **Rate Limits**: Mentioned but specific details not publicly disclosed
- **Available Endpoints**: 
  - Real Estate Listings
  - Geo Services
  - Construction Financing
  - Property Details (Expose)
  - Search functionality
  - Widgets
- **Additional Resources**: Postman Collections, SDKs, API Reference

### 2. **Idealista.com (Spain)**
- **API Available**: ✅ Yes - Request-based access
- **Documentation URL**: https://developers.idealista.com/access-request
- **Authentication**: OAuth2
- **Rate Limits**: Max 50 items per search, max 33 pages in public version
- **Available Endpoints**: Property search, listings data
- **Coverage**: Spain, Italy, Portugal
- **Access**: Requires approval through access request form

### 3. **Daft.ie (Ireland)**
- **API Available**: ✅ Yes - SOAP-based API
- **Documentation URL**: https://api.daft.ie/doc/v3/
- **Authentication**: API key required (hex string, max 40 characters)
- **Rate Limits**: Not specified
- **Available Endpoints**:
  - Property searches (sales, rentals, commercial)
  - New development searches
  - Short-term rentals
  - Student accommodation
  - Media/image retrieval
- **Additional Resources**: Code examples in multiple languages, PHP5 samples

### 4. **FINN.no (Norway)**
- **API Available**: ✅ Yes - Partner/advertiser access only
- **Documentation URL**: https://www.finn.no/api/ and https://docs.finn.com/
- **Authentication**: API key required
- **Rate Limits**: Not specified
- **Available Endpoints**:
  - Search endpoints (/iad/search/*)
  - Ad details (/iad/ad/*)
  - Service document (/iad/)
- **Base URL**: https://cache.api.finn.no/
- **Access**: Limited to advertisers and business partners only

### 5. **Hemnet.se (Sweden)**
- **API Available**: ✅ Yes - BostadsAPI
- **Documentation URL**: https://integration.hemnet.se/documentation/v1
- **Authentication**: Not specified in available information
- **Rate Limits**: Not specified
- **Available Endpoints**: Not detailed in public information
- **Additional**: JSON specification available at integration.hemnet.se/documentation/v1.json

### 6. **Immoweb.be (Belgium)**
- **API Available**: ✅ Yes - Requires credentials
- **Documentation URL**: https://developer.immoweb.be/
- **Authentication**: API credentials required (contact api@immoweb.be)
- **Rate Limits**: Not specified
- **Available Endpoints**: Customer authentication, classified pipeline endpoints
- **API Versions**: V2 (being deprecated), V3 (in development)

### 7. **Otodom.pl (Poland)**
- **API Available**: ✅ Yes - OLX Group RE API
- **Documentation URL**: https://developer.olxgroup.com/
- **Authentication**: client_id, client_secret, api_key required
- **Rate Limits**: Not specified
- **Available Endpoints**: Real estate marketplace operations
- **Coverage**: Poland (Otodom), Romania (Storia), Portugal (Imovirtual)

### 8. **Ingatlan.com (Hungary)**
- **API Available**: ✅ Yes - Commercial/agent access
- **Documentation URL**: https://api.ingatlan.com/v1/doc
- **Authentication**: Subscription to "Automata betöltés" required
- **Rate Limits**: Not specified
- **Available Endpoints**: Authentication, photo management, advertisement management
- **GitHub**: https://github.com/ingatlancom/api-client
- **Target Users**: Real estate agents with subscriptions

## ⚠️ Limited or Partner-Only Access

### 9. **Rightmove.co.uk (UK)**
- **API Available**: ❌ No public API
- **Documentation URL**: https://www.rightmove.co.uk/adf.html (ADF - partner only)
- **Authentication**: PEM certificate/password, Network ID, Branch ID (partners only)
- **Rate Limits**: N/A
- **Available Endpoints**: ADF (Automated Datafeed) for authorized partners only
- **Note**: Contact adfsupport@rightmove.co.uk for partner access

### 10. **Immobiliare.it (Italy)**
- **API Available**: ⚠️ Partner/integration focused
- **Documentation URL**: https://www.immobiliare.it/insights/en/api/
- **Authentication**: HTTP BASIC authentication with credentials from support team
- **Rate Limits**: Not specified
- **Available Endpoints**: Realtycs API for property data, demographic data, POI
- **Access**: Contact support team for credentials and IP whitelisting

### 11. **Homegate.ch (Switzerland)**
- **API Available**: ⚠️ Limited/hackathon access
- **Documentation URL**: https://homegate.3scale.net (hackathon/limited access)
- **Authentication**: Not specified
- **Rate Limits**: Not specified
- **Available Endpoints**: Property search functionality
- **Note**: Primarily for hackathon/educational use

## ❌ No Public APIs Available

### 12. **Funda.nl (Netherlands)**
- **API Available**: ❌ No public API
- **Documentation URL**: N/A
- **Authentication**: N/A
- **Rate Limits**: N/A
- **Available Endpoints**: Partner API exists (http://partnerapi.funda.nl/feeds/Aanbod.svc) but not public
- **Alternative**: RSS feeds (limited to 15 properties), third-party scrapers

### 13. **SeLoger.com (France)**
- **API Available**: ❌ No official public API
- **Documentation URL**: N/A (Web service endpoints exist: http://ws.seloger.com)
- **Authentication**: N/A
- **Rate Limits**: N/A
- **Available Endpoints**: Unofficial endpoints for search, listing details, total counts
- **Alternative**: Third-party APIs via RapidAPI, Piloterr, Apify

### 14. **Spitogatos.gr (Greece)**
- **API Available**: ❌ No public developer portal
- **Documentation URL**: N/A
- **Authentication**: XML-RPC web services with API key (limited info)
- **Rate Limits**: Not specified
- **Available Endpoints**: Limited XML-RPC services (webservices.spitogatos.gr)
- **Alternative**: Third-party scrapers, Spitogatos Insights (commercial data service)

### 15. **Sreality.cz (Czech Republic)**
- **API Available**: ❌ No official public API
- **Documentation URL**: N/A
- **Authentication**: N/A
- **Rate Limits**: N/A  
- **Available Endpoints**: None officially
- **Alternative**: Unofficial JavaScript client, third-party scrapers via Apify

## Summary

**APIs with Full Public Access (8 sites):**
- ImmoScout24.de, Idealista.com, Daft.ie, FINN.no, Hemnet.se, Immoweb.be, Otodom.pl, Ingatlan.com

**Limited/Partner Access (3 sites):**
- Rightmove.co.uk, Immobiliare.it, Homegate.ch

**No Public APIs (4 sites):**
- Funda.nl, SeLoger.com, Spitogatos.gr, Sreality.cz

**Key Findings:**
- Most German, Scandinavian, and Eastern European portals offer APIs
- UK and Dutch markets are more restrictive
- Authentication typically requires API keys or OAuth
- Rate limits are rarely disclosed publicly
- Many sites without official APIs have third-party scraping alternatives