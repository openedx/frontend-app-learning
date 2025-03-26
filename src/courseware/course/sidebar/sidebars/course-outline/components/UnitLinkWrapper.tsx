import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useCourseOutlineSidebar } from '../hooks';

interface Props {
  courseId: string;
  sequenceId: string;
  activeUnitId: string;
  id: string;
  children?: React.ReactNode;
}

/*
 * UnitLinkWrapper is necessary for unit navigation within the OutlineTrayPlugin.
 * import { Link } from 'react-router-dom' throws errors inside the plugin
 * because the package tries to load two versions of 'react-router-dom' or a
 * route can not be found. This component abstracts the import into a wrapper
 * component that can be imported into plugins without a render error.
 */

const UnitLinkWrapper: React.FC<Props> = ({
  sequenceId,
  activeUnitId,
  id,
  courseId,
  children,
}) => {
  const { handleUnitClick } = useCourseOutlineSidebar();
  const { pathname } = useLocation();
  const isPreview = pathname.startsWith('/preview');
  const baseUrl = `/course/${courseId}/${sequenceId}/${id}`;
  const link = isPreview ? `/preview${baseUrl}` : baseUrl;

  return (
    <Link
      to={link}
      className="row w-100 m-0 d-flex align-items-center text-gray-700"
      onClick={() => handleUnitClick({ sequenceId, activeUnitId, id })}
    >
      {children}
    </Link>
  );
};

export default UnitLinkWrapper;
