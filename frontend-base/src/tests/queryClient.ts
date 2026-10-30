import { QueryClient, type QueryKey } from '@tanstack/react-query';

export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

// Seed a query result so components under test render as loaded without fetching.
// The seeded entry is marked never-stale so mounting observers don't refetch over it.
export const seedQueryData = (queryClient: QueryClient, queryKey: QueryKey, data: unknown) => {
  queryClient.setQueryDefaults(queryKey, { staleTime: Infinity });
  queryClient.setQueryData(queryKey, data);
};
