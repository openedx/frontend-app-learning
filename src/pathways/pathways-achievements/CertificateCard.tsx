import classNames from 'classnames';
import { Button, Icon, Stack } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { PathwayAchievementData } from '@src/pathways/data/types';

import { ReactComponent as NewModeIcon } from './newsmode.svg';
import messages from './messages';

export interface CertificateCardProps extends PathwayAchievementData {
  categoryLabel?: string;
}

export const CertificateCard = ({
  credentialId,
  displayName,
  providerName,
  completedOn,
  isOverarching,
  categoryLabel,
}: CertificateCardProps) => {
  const subtitle = isOverarching ? messages.pathwayCertificate : messages.itemCertificate;

  return (
    <section className={classNames(
      'w-100 rounded p-4',
      {
        'bg-primary-100 border border-primary-300': isOverarching,
        'bg-light-200 raised-card': !isOverarching,
      },
    )}
    >
      <Stack gap={3}>
        <Stack>
          <Stack direction="horizontal" gap={1}>
            <Icon className="text-info-800" src={NewModeIcon} />
            <span className="small">
              <FormattedMessage {...subtitle} values={{ categoryLabel }} />
            </span>
          </Stack>
          <span className="h4">
            {displayName}
          </span>
        </Stack>
        <Stack>
          <span className="text-gray-500 small">
            {providerName}
          </span>
          <span className="small">
            <FormattedMessage {...messages.completed} values={{ date: completedOn }} />
          </span>
        </Stack>
        <Button className="w-75">
          <FormattedMessage {...messages.viewCertificateButton} />
        </Button>
        <Stack>
          <span className="text-gray-500 small">
            <FormattedMessage {...messages.credentialId} />
          </span>
          <span className="text-gray-500 small">
            {credentialId}
          </span>
        </Stack>
      </Stack>
    </section>
  );
};
