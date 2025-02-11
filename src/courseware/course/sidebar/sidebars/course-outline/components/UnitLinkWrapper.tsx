import React from 'react';
import { Link } from 'react-router-dom';

import { useCourseOutlineSidebar } from '../hooks';

interface Props {
  courseId: string;
  sequenceId: string;
  activeUnitId: string;
  id: string;
  children?: React.ReactNode;
}

const UnitLinkWrapper: React.FC<Props> = ({
  sequenceId,
  activeUnitId,
  id,
  courseId,
  children,
}) => {
  const { handleUnitClick } = useCourseOutlineSidebar();

  return (
    <Link
      to={`/course/${courseId}/${sequenceId}/${id}`}
      className="row w-100 m-0 d-flex align-items-center text-gray-700"
      onClick={() => handleUnitClick({ sequenceId, activeUnitId, id })}
    >
      {children}
    </Link>
  );
};

export default UnitLinkWrapper;
