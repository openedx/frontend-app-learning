import { ReactElement } from 'react';
import classNames from 'classnames';
import { Badge } from '@openedx/paragon';

import { isValidCssColor } from './utils';

export interface ItemBadgeProps {
  categoryLabel: string | ReactElement;
  categoryBackgroundColor?: string;
  categoryTextColor?: string;
  className?: string;
}

export const ItemBadge = ({
  categoryLabel,
  categoryBackgroundColor,
  categoryTextColor,
  className,
}: ItemBadgeProps) => {
  const hasCustomColors = !!categoryBackgroundColor
    && !!categoryTextColor
    && isValidCssColor(categoryBackgroundColor)
    && isValidCssColor(categoryTextColor);

  return (
    <Badge
      className={classNames('p-1.5', className, {
        'bg-info-200 text-info-800': !hasCustomColors && !className,
      })}
      style={hasCustomColors ? {
        backgroundColor: categoryBackgroundColor,
        color: categoryTextColor,
      } : undefined}
    >
      {categoryLabel}
    </Badge>
  );
};
