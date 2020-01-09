import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getConfig } from '@edx/frontend-platform';

import CourseStructureContext from './CourseStructureContext';
import { useBlockAncestry } from './hooks';

const CourseBreadcrumbs = () => {
  const { courseId, unitId } = useContext(CourseStructureContext);

  const ancestry = useBlockAncestry(unitId);

  const links = ancestry.map(ancestor => ({
    id: ancestor.id,
    label: ancestor.displayName,
    url: `${getConfig().LMS_BASE_URL}/courses/${courseId}/course/#${ancestor.id}`,
  }));

  return (
    <nav aria-label="breadcrumb">
      <ol className="list-inline">
        {links.map(({ id, url, label }, i) => (
          <CourseBreadcrumb key={id} url={url} label={label} last={i === links.length - 1} />
        ))}
      </ol>
    </nav>
  );
};

export default CourseBreadcrumbs;

function CourseBreadcrumb({ url, label, last }) {
  return (
    <React.Fragment key={`${label}-${url}`}>
      <li className="list-inline-item">
        {last ? label : (<a href={url}>{label}</a>)}
      </li>
      {!last &&
        <li className="list-inline-item" role="presentation" aria-label="spacer">
          <FontAwesomeIcon icon={faChevronRight} />
        </li>
      }
    </React.Fragment>
  );
}

CourseBreadcrumb.propTypes = {
  url: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  last: PropTypes.bool.isRequired,
};
