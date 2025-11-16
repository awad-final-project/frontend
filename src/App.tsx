import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "@/components/ErrorFallback";
import PageNotFound from "@/components/PageNotFound";
import { Toaster } from "@/components/ui/toaster";
import { routeTree } from "@/routeTree.gen";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => {
        if (error instanceof HTTPError) {
          return error.response?.status >= 500;
        }
        return false;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 🎉 only show error toasts if we already have data in the cache
      // which indicates a failed background update
      if (query.state.data !== undefined) {
        // toast error message
        console.error(error);
      }
    },
  }),
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: () => <PageNotFound />,
  defaultErrorComponent: () => <ErrorFallback />,
});

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
