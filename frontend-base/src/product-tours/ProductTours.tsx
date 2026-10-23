import type { FC } from 'react';

// https://github.com/openedx/frontend-app-learning/issues/2208
interface ProductToursProps {
  activeTab: string;
  courseId: string;
  isStreakCelebrationOpen: boolean;
  org: string;
}

const ProductTours: FC<ProductToursProps> = () => null;

export default ProductTours;
