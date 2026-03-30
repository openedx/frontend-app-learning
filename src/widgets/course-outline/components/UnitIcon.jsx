import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Locked as LockedIcon,
  Article as ArticleIcon,
  LmsBook as LmsBookIcon,
  LmsBookComplete as LmsBookCompleteIcon,
  LmsEditSquare as LmsEditSquareIcon,
  LmsEditSquareComplete as LmsEditSquareCompleteIcon,
  LmsVideocam as LmsVideocamIcon,
  LmsVideocamComplete as LmsVideocamCompleteIcon,
} from '@openedx/paragon/icons';

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
      default: LmsVideocamIcon,
      complete: LmsVideocamCompleteIcon,
    },
    [UNIT_ICON_TYPES.problem]: {
      default: LmsEditSquareIcon,
      complete: LmsEditSquareCompleteIcon,
    },
    [UNIT_ICON_TYPES.vertical]: ArticleIcon,
    [UNIT_ICON_TYPES.lock]: LockedIcon,
    [UNIT_ICON_TYPES.other]: {
      default: LmsBookIcon,
      complete: LmsBookCompleteIcon,
    },
  };

  let Icon = iconMap[type || UNIT_ICON_TYPES.other];

  if (typeof Icon === 'object') {
    Icon = iconMap[type || UNIT_ICON_TYPES.other]?.[isCompleted ? 'complete' : 'default'];
  }

  return (
    <Icon {...props} className={classNames({ 'text-success': isCompleted, 'text-gray-300': !isCompleted })} />
  );
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(Object.keys(UNIT_ICON_TYPES)).isRequired,
  isCompleted: PropTypes.bool.isRequired,
};

export default UnitIcon;
