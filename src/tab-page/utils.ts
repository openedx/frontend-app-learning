import type { UseQueryResult } from '@tanstack/react-query';

import { getErrorDetail, type RequestError } from '../data/http-error';

// A tab hands TabPage its metadata + tab-data queries and lets TabPage derive the view; a tab
// whose data comes from more than one query passes them as `tabDataQueries`.
export type TabStatus<TMetadata> = {
  metadataQuery: UseQueryResult<TMetadata, RequestError>;
} & (
  | { tabDataQuery?: UseQueryResult; tabDataQueries?: never }
  | { tabDataQuery?: never; tabDataQueries: UseQueryResult[] }
);

export interface TabView {
  isLoading: boolean;
  isError: boolean;
  isDenied: boolean;
  errorDetails?: string[];
}

const getErrorDetails = (queries: { error: unknown }[]): string[] => {
  const details = queries.flatMap((query) => getErrorDetail(query.error) || []);
  return [...new Set(details)];
};

// `hasAccess` tells whether the resolved metadata grants access; pages without an access
// check omit it.
export const deriveView = <TMetadata>(
  status: TabStatus<TMetadata>,
  hasAccess: (metadata: TMetadata) => boolean = () => true,
): TabView => {
  const view = { isLoading: false, isError: false, isDenied: false };

  // Access is read from the metadata query, resolved before tabData is considered.
  const {
    metadataQuery,
    tabDataQuery,
    tabDataQueries = tabDataQuery ? [tabDataQuery] : [],
  } = status;
  if (metadataQuery.isError) {
    return { ...view, isError: true, errorDetails: getErrorDetails([metadataQuery]) };
  }
  if (metadataQuery.isPending) { return { ...view, isLoading: true }; }
  if (tabDataQueries.some((query) => query.isPending)) { return { ...view, isLoading: true }; }
  if (!metadataQuery.data || !hasAccess(metadataQuery.data)) { return { ...view, isDenied: true }; }
  const failedQueries = tabDataQueries.filter((query) => query.isError);
  if (failedQueries.length > 0) {
    return { ...view, isError: true, errorDetails: getErrorDetails(failedQueries) };
  }
  return view;
};
