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
import React, { SVGProps } from 'react';

export const UNIT_ICON_TYPES = {
  video: 'video',
  problem: 'problem',
  vertical: 'vertical',
  lock: 'lock',
  other: 'other',
} as const;

export type UnitIconType = typeof UNIT_ICON_TYPES[keyof typeof UNIT_ICON_TYPES];

export interface UnitIconProps extends SVGProps<SVGSVGElement> {
  type: UnitIconType;
  isCompleted: boolean;
}

type IconType = React.ComponentType<SVGProps<SVGSVGElement>>;

interface IconPair {
  default: IconType;
  complete: IconType;
}

type IconMapVal = IconType | IconPair;

function isIconPair(val: IconMapVal): val is IconPair {
  return typeof val === 'object' && 'default' in val && 'complete' in val;
}

const UnitIcon = ({ type, isCompleted, ...props }: UnitIconProps) => {
  const iconMap: Record<UnitIconType, IconMapVal> = {
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

  const iconEntry = iconMap[type || UNIT_ICON_TYPES.other];
  const Icon: IconType = isIconPair(iconEntry) ? iconEntry[isCompleted ? 'complete' : 'default'] : iconEntry;

  return (
    <Icon {...props} className={classNames({ 'text-success': isCompleted, 'text-gray-300': !isCompleted })} />
  );
};

export default UnitIcon;
