import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { DECODE_ROUTES } from '@src/constants';
import { PATHWAY_TAB_SLUGS } from './constants';
import type { PathwayTabMetadata } from './types';
import messages from './messages';

const PATHWAY_TABS = [
  // TODO: The Outline Tab title must be the category label
  { tabId: PATHWAY_TAB_SLUGS.OUTLINE, route: DECODE_ROUTES.PATHWAY_OUTLINE, message: messages.home },
  { tabId: PATHWAY_TAB_SLUGS.PROGRESS, route: DECODE_ROUTES.PATHWAY_PROGRESS, message: messages.progress },
  { tabId: PATHWAY_TAB_SLUGS.ACHIEVEMENTS, route: DECODE_ROUTES.PATHWAY_ACHIEVEMENTS, message: messages.achievements },
];

export const usePathwayTabs = (pathwayId?: string): PathwayTabMetadata[] => {
  const intl = useIntl();
  return useMemo(() => {
    if (!pathwayId) { return []; }
    return PATHWAY_TABS.map(({ tabId, route, message }) => ({
      tabId,
      title: intl.formatMessage(message),
      url: generatePath(route, { pathwayId }),
    }));
  }, [intl, pathwayId]);
};
