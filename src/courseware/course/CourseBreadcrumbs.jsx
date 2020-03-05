import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import CourseBreadcrumb from './CourseBreadcrumb';

export default function CourseBreadcrumbs({
  courseUsageKey, courseId, sequenceId, models,
}) {
  const links = useMemo(() => {
    const sectionId = models[sequenceId].parentId;
    return [sectionId, sequenceId].map((nodeId) => {
      const node = models[nodeId];
      return {
        id: node.id,
        label: node.displayName,
        url: `${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/course/#${node.id}`,
      };
    });
  }, [courseUsageKey, courseId, sequenceId, models]);

  return (
    <nav aria-label="breadcrumb" className="my-4">
      <ol className="list-inline m-0">
        <li className="list-inline-item">
          <a href={`${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/course/`}>
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <FormattedMessage
              id="learn.breadcrumb.navigation.course.home"
              description="The course home link in breadcrumbs nav"
              defaultMessage="Course"
            />
          </a>
        </li>
        {links.map(({ id, url, label }, i) => (
          <CourseBreadcrumb key={id} url={url} label={label} last={i === links.length - 1} />
        ))}
      </ol>
    </nav>
  );
}

CourseBreadcrumbs.propTypes = {
  courseUsageKey: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  models: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.string),
    parentId: PropTypes.string,
  })).isRequired,
};
