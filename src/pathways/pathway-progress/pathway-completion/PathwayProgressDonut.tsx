import { useIntl } from '@edx/frontend-platform/i18n';

import { PathwayProgressRing } from '../progress-ring/PathwayProgressRing';
import messages from './messages';

export interface PathwayProgressDonutProps {
  completed: number;
  total: number;
}

export const PathwayProgressDonut = ({ completed, total }: PathwayProgressDonutProps) => {
  const intl = useIntl();
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <PathwayProgressRing
      className="learning-pathway-progress-donut"
      percentage={percentage}
      role="img"
      aria-label={intl.formatMessage(messages.completedItems, { completed, total })}
    >
      <g aria-hidden="true">
        <text className="donut-count" x="21" y="22">{`${completed}/${total}`}</text>
        <text className="donut-label" x="21" y="27">{intl.formatMessage(messages.completed)}</text>
      </g>
    </PathwayProgressRing>
  );
};
