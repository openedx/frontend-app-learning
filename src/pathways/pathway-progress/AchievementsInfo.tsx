import { generatePath, Link } from 'react-router-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import { DECODE_ROUTES } from '@src/constants';

import messages from './messages';

export interface AchievementsInfoProps {
  pathwayId: string;
  hasAchievements: boolean;
}

export const AchievementsInfo = ({ pathwayId, hasAchievements }: AchievementsInfoProps) => {
  const title = hasAchievements ? messages.achievementsInfoTitle : messages.achievementsInfoEmptyTitle;
  const description = hasAchievements
    ? messages.achievementsInfoDescription
    : messages.achievementsInfoEmptyDescription;

  return (
    <section className="bg-light-200 rounded raised-card p-4">
      <p className="h4">
        <FormattedMessage {...title} />
      </p>
      <p className="small">
        <FormattedMessage {...description} />
      </p>
      {hasAchievements && (
        <Button
          as={Link}
          to={generatePath(DECODE_ROUTES.PATHWAY_ACHIEVEMENTS, { pathwayId })}
          variant="outline-primary"
          className="w-100"
        >
          <FormattedMessage {...messages.achievementsInfoButton} />
        </Button>
      )}
    </section>
  );
};
