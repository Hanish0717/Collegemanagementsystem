import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export let routerInstance: any = null;

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultSsr: false,
  });

  routerInstance = router;
  if (typeof window !== "undefined") {
    (window as any).router = router;
  }

  return router;
};
