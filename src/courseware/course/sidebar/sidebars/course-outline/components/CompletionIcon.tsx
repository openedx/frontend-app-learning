import {
  CheckCircle as CheckCircleIcon,
  LmsCompletionSolid as LmsCompletionSolidIcon,
} from '@openedx/paragon/icons';

import { DashedCircleIcon } from '../icons';

export interface CompletionIconProps {
  completionStat: {
    completed: number;
    total: number;
  };
  enabled: boolean;
}

export const CompletionIcon = ({ completionStat: { completed = 0, total = 0 }, enabled }: CompletionIconProps) => {
  const percentage = total !== 0 ? Math.min((completed / total) * 100, 100) : 0;
  const remainder = 100 - percentage;

  switch (true) {
    case !completed || !enabled:
      return <LmsCompletionSolidIcon className="text-gray-300" data-testid="completion-solid-icon" />;
    case completed === total:
      return <CheckCircleIcon className="text-success" data-testid="check-circle-icon" />;
    default:
      return <DashedCircleIcon percentage={percentage} remainder={remainder} data-testid="dashed-circle-icon" />;
  }
};

export default CompletionIcon;
