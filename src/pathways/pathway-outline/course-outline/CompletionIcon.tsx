import { Icon } from '@openedx/paragon';
import { CheckCircle, CheckCircleOutline } from '@openedx/paragon/icons';

export const CompletionIcon = ({ complete }: { complete: boolean }) => (
  <Icon
    src={complete ? CheckCircle : CheckCircleOutline}
    className={complete ? 'text-success' : 'text-gray-400'}
    size="sm"
    aria-hidden
  />
);
