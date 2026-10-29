import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { DECODE_ROUTES } from '@src/constants';
import type { PathwayTabMetadata } from './types';
import messages from './messages';

const PATHWAY_TABS = [
  // TODO: The Outline Tab title must be the category label
  { tabId: 'outline', route: DECODE_ROUTES.PATHWAY_OUTLINE, message: messages.home },
  { tabId: 'progress', route: DECODE_ROUTES.PATHWAY_PROGRESS, message: messages.progress },
  { tabId: 'achievements', route: DECODE_ROUTES.PATHWAY_ACHIEVEMENTS, message: messages.achievements },
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
