import PropTypes from 'prop-types';
import {
  CheckCircle as CheckCircleIcon,
  LmsCompletionSolid as LmsCompletionSolidIcon,
} from '@openedx/paragon/icons';

import { DashedCircleIcon } from '../icons';

const CompletionIcon = ({ completionStat: { completed = 0, total = 0 } }) => {
  const percentage = total !== 0 ? Math.min((completed / total) * 100, 100) : 0;
  const remainder = 100 - percentage;

  switch (true) {
    case !completed:
      return <LmsCompletionSolidIcon className="text-gray-300" data-testid="completion-solid-icon" />;
    case completed === total:
      return <CheckCircleIcon className="text-success" data-testid="check-circle-icon" />;
    default:
      return <DashedCircleIcon percentage={percentage} remainder={remainder} data-testid="dashed-circle-icon" />;
  }
};

CompletionIcon.propTypes = {
  completionStat: PropTypes.shape({
    completed: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
};

export default CompletionIcon;
