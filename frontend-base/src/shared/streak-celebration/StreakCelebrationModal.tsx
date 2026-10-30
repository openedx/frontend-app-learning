import type { FC } from 'react';

import type { CourseHomeMeta } from '@src/course-home/data/api';

// https://github.com/openedx/frontend-app-learning/issues/2201
interface StreakModalProps {
  courseId: string;
  streakLengthToCelebrate?: number | null;
  isStreakCelebrationOpen?: boolean;
  closeStreakCelebration: () => void;
  streakDiscountCouponEnabled?: unknown;
  verifiedMode?: CourseHomeMeta['verifiedMode'];
}

const StreakModal: FC<StreakModalProps> = () => null;

export default StreakModal;
