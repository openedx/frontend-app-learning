import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink, Icon } from '@openedx/paragon';
import { ArrowOutward } from '@openedx/paragon/icons';

import { PathwayProgressDonut } from '../progress-donut/PathwayProgressDonut';
import { messages } from './messages';

export interface PathwayOverviewProps {
  categoryLabel: string;
  completed: number;
  total: number;
  detailsUrl?: string;
}

export const PathwayOverview = ({
  categoryLabel, completed, total, detailsUrl,
}: PathwayOverviewProps) => (
  <>
    <section className="bg-light-200 rounded raised-card p-4 text-center">
      <h2 className="h4">
        <FormattedMessage {...messages.overviewTitle} values={{ categoryLabel }} />
      </h2>
      <PathwayProgressDonut completed={completed} total={total} />
      <p className="mt-3 mb-0">
        <FormattedMessage {...messages.overviewCompletedCount} values={{ completed, total }} />
      </p>
    </section>
    {/* The details page lives in the catalog MFE, so it is a plain link instead of a router one */}
    {detailsUrl && (
      <Hyperlink
        destination={detailsUrl}
        variant="muted"
        showLaunchIcon={false}
        className="d-inline-flex align-items-center mt-3 small"
      >
        <FormattedMessage {...messages.overviewDetailsLink} values={{ categoryLabel: categoryLabel.toLowerCase() }} />
        <Icon src={ArrowOutward} size="xs" className="ml-1" aria-hidden />
      </Hyperlink>
    )}
  </>
);
