import { type ReactNode } from 'react';
import { Helmet } from 'react-helmet';

import { useIntl } from '@edx/frontend-platform/i18n';
import { FooterSlot } from '@edx/frontend-component-footer';
import { getConfig } from '@edx/frontend-platform';

import { deriveView, type TabStatus } from '@src/tab-page/utils';
import PageLoading from '@src/generic/PageLoading';
import HeaderSlot from '@src/plugin-slots/HeaderSlot';

import messages from './messages';
import type { PathwayData } from '../data/types';
import { usePathwayTabs } from '../pathway-tabs/hooks';
import { PathwayTabsNavigation } from '../pathway-tabs/PathwayTabsNavigation';

export type PathwayStatus = TabStatus<PathwayData>;

export interface TabPageProps {
  activeTabSlug: string;
  pathwayId?: string;
  pathwayStatus: PathwayStatus;
  children?: ReactNode;
}

export const TabPage = ({
  activeTabSlug,
  pathwayId,
  pathwayStatus,
  children,
}: TabPageProps) => {
  const intl = useIntl();
  const {
    pathway,
    provider,
  } = pathwayStatus.metadataQuery.data ?? {};
  const title = pathway?.content.displayName ?? '';
  const tabs = usePathwayTabs(pathwayId);
  const activeTabTitle = tabs.find((tab) => tab.tabId === activeTabSlug)?.title;

  const {
    isLoading, isError, isDenied, errorDetails,
  } = deriveView(pathwayStatus);

  if (isDenied) {
    // TODO: For now, `isDenied` is always `false`.
    // We need to wait for the backend to see how `isDenied`
    // is determined—whether it’s based on a response code
    // or a field in the returned data.
  }

  const shouldRenderContent = !isLoading && !isError;

  const renderLoading = () => (
    <PageLoading srMessage={intl.formatMessage(messages.loading)} />
  );

  const renderError = () => {
    const errorMessages = errorDetails?.length ? errorDetails : [intl.formatMessage(messages.failure)];
    return (
      <div className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
        {errorMessages.map((errorMessage) => <p key={errorMessage}>{errorMessage}</p>)}
      </div>
    );
  };

  const renderLoadedTabPage = () => (
    <>
      <Helmet>
        <title>{`${activeTabTitle ? `${activeTabTitle} | ` : ''}${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <main className="d-flex flex-column flex-grow-1">
        <PathwayTabsNavigation tabs={tabs} activeTabSlug={activeTabSlug} />
        <div id="main-content" className="container-xl">
          {children}
        </div>
      </main>
    </>
  );

  return (
    <>
      <HeaderSlot
        courseOrg={provider?.name ?? ''}
        courseTitle={title}
      />
      {isLoading && renderLoading()}
      {shouldRenderContent && renderLoadedTabPage()}
      {isError && renderError()}
      <FooterSlot />
    </>
  );
};
