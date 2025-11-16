import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      }))
    );

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <main>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </main>
  ),
});
