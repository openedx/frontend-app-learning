import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

function CourseBreadcrumb({
  url, children, withSeparator, ...attrs
}) {
  return (
    <>
      {withSeparator && (
        <li className="mx-2 text-gray-300" role="presentation" aria-hidden>/</li>
      )}
      <li {...attrs}>
        <a href={url}>{children}</a>
      </li>
    </>
  );
}

CourseBreadcrumb.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  withSeparator: PropTypes.bool,
};

CourseBreadcrumb.defaultProps = {
  withSeparator: false,
};


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
      <ol className="list-unstyled d-flex m-0">
        <CourseBreadcrumb
          url={`${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/course/`}
          className="flex-shrink-0"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          <FormattedMessage
            id="learn.breadcrumb.navigation.course.home"
            description="The course home link in breadcrumbs nav"
            defaultMessage="Course"
          />
        </CourseBreadcrumb>
        {links.map(({ id, url, label }) => (
          <CourseBreadcrumb
            key={id}
            url={url}
            withSeparator
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </CourseBreadcrumb>
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
