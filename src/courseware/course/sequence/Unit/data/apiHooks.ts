import { useQuery } from '@tanstack/react-query';
import * as api from './api';

// Query key patterns. Allows an easy way to clear all data.
// https://github.com/openedx/frontend-app-admin-portal/blob/2ba315d/docs/decisions/0006-tanstack-react-query.rst
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const queryKeys = {
  all: ['unit-page'],
  /**
   * Key for the list of taxonomies, optionally filtered by org.
   * @param {string} [org] Which org we fetched the taxonomy list for (optional)
   */
  unitContents: (unitId: string) => [...queryKeys.all, 'unit', unitId, 'contents'],
};

/**
 * Builds the query to get the taxonomy list
 * @param {string} [org] Filter the list to only show taxonomies assigned to this org
 */
export const useUnitContents = (unitId: string) => (
  useQuery({
    queryKey: queryKeys.unitContents(unitId),
    queryFn: () => api.getUnitContentsData(unitId),
  })
);
