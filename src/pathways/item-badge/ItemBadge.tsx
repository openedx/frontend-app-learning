import { ReactElement } from 'react';
import { Badge } from '@openedx/paragon';

export interface ItemBadgeProps {
  categoryLabel: string | ReactElement;
  categoryBackgroundColor: string;
  categoryTextColor: string;
}

export const ItemBadge = ({
  categoryLabel,
  categoryBackgroundColor,
  categoryTextColor,
}: ItemBadgeProps) => (
  <Badge
    className="p-1.5"
    style={{
      backgroundColor: categoryBackgroundColor,
      color: categoryTextColor,
    }}
  >
    {categoryLabel}
  </Badge>
);
