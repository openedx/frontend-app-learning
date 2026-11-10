import type { FC } from 'react';

// https://github.com/openedx/frontend-app-learning/issues/2194
interface InstructorToolbarProps {
  courseId?: string;
  unitId?: string | null;
  isStudioButtonVisible?: boolean;
  tab?: string;
}

const InstructorToolbar: FC<InstructorToolbarProps> = () => null;

export default InstructorToolbar;
