import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Locked as LockedIcon,
  Article as ArticleIcon,
} from '@openedx/paragon/icons';

import {
  BookCompleteIcon,
  BookIcon,
  EditSquareCompleteIcon,
  EditSquareIcon,
  VideocamCompleteIcon,
  VideocamIcon,
} from './icons';

export const UNIT_ICON_TYPES = {
  video: 'video',
  problem: 'problem',
  vertical: 'vertical',
  lock: 'lock',
  other: 'other',
};

const UnitIcon = ({ type, isCompleted, ...props }) => {
  const iconMap = {
    [UNIT_ICON_TYPES.video]: {
      default: VideocamIcon,
      complete: VideocamCompleteIcon,
    },
    [UNIT_ICON_TYPES.problem]: {
      default: EditSquareIcon,
      complete: EditSquareCompleteIcon,
    },
    [UNIT_ICON_TYPES.vertical]: ArticleIcon,
    [UNIT_ICON_TYPES.lock]: LockedIcon,
    [UNIT_ICON_TYPES.other]: {
      default: BookIcon,
      complete: BookCompleteIcon,
    },
  };

  let Icon = iconMap[type || UNIT_ICON_TYPES.other];

  if (typeof Icon === 'object') {
    Icon = iconMap[type || UNIT_ICON_TYPES.other]?.[isCompleted ? 'complete' : 'default'];
  }

  return (
    <Icon {...props} className={classNames({ 'text-success': isCompleted, 'text-gray-700': !isCompleted })} />
  );
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(Object.keys(UNIT_ICON_TYPES)).isRequired,
  isCompleted: PropTypes.bool.isRequired,
};

export default UnitIcon;
