<script lang="ts">
  import { onMount } from "svelte";
  import ErrorBoundary from "../components/ErrorBoundary.svelte";
  import ErrorDisplay from "../components/ErrorDisplay.svelte";
  import { LoadingSpinner, ErrorMessage } from "../components/UI";
  import { AppErrorHandler } from "../utils/errorHandler";
  import { logger } from "../utils/logger";

  let isLoading = false;
  let hasInitialError = false;

  const loadPropertyData = async () => {
    logger.info('Starting property data load', {}, 'Page', 'loadPropertyData');
    isLoading = true;
    hasInitialError = false;
    
    try {
      // TODO: Implement property search functionality
      logger.info('Property search functionality will be implemented here');
      isLoading = false;
    } catch (error) {
      logger.error('Failed to load property data', 
        { error: error instanceof Error ? error.message : String(error) }, 
        'Page', 
        'loadPropertyData'
      );
      AppErrorHandler.handleRuntimeError(error, { 
        operation: 'initial-load',
        component: 'page' 
      });
      hasInitialError = true;
      isLoading = false;
    }
  };

  onMount(loadPropertyData);
</script>

<ErrorBoundary fallback="Failed to load the Tadaima application" retryAction={loadPropertyData}>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-base-content mb-2">
        🏠 Tadaima
      </h1>
      <p class="text-base-content/70 text-lg">
        Find your home across Europe
      </p>
      <p class="text-base-content/50 text-sm mt-2">
        Search properties from multiple European real estate portals
      </p>
    </div>
    
    {#if isLoading}
      <LoadingSpinner size="lg" text="Loading property search..." />
    {:else if hasInitialError}
      <ErrorMessage 
        title="Failed to Load Application"
        message="We couldn't load the property search. Please try again."
        retryAction={loadPropertyData}
        retryText="Retry"
      />
    {:else}
      <ErrorBoundary fallback="An error occurred while loading the property search">
        <div class="space-y-6">
          <div class="text-center p-8 bg-base-200 rounded-lg">
            <h2 class="text-2xl font-semibold mb-4">Coming Soon!</h2>
            <p class="text-base-content/70 mb-4">
              Property search interface is being built. The GraphQL API is ready and supports:
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div class="bg-base-100 p-4 rounded">
                <h3 class="font-semibold">🇩🇪 ImmoScout24</h3>
                <p class="text-sm text-base-content/60">Germany</p>
              </div>
              <div class="bg-base-100 p-4 rounded">
                <h3 class="font-semibold">🇪🇸 Idealista</h3>
                <p class="text-sm text-base-content/60">Spain, Italy, Portugal</p>
              </div>
              <div class="bg-base-100 p-4 rounded">
                <h3 class="font-semibold">🇮🇪 Daft</h3>
                <p class="text-sm text-base-content/60">Ireland</p>
              </div>
              <div class="bg-base-100 p-4 rounded">
                <h3 class="font-semibold">🚀 More APIs</h3>
                <p class="text-sm text-base-content/60">Coming soon...</p>
              </div>
            </div>
            <div class="mt-6">
              <a href="http://localhost:4000" 
                 class="btn btn-primary"
                 target="_blank"
                 rel="noopener noreferrer">
                Explore GraphQL API
              </a>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    {/if}
  </div>
</ErrorBoundary>

<!-- Global error display -->
<ErrorDisplay />