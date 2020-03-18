import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import {
  courseShape, sectionShape, sequenceShape, statusShape,
} from './shapes';

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
  course,
  section,
  sequence,
  status,
}) {
  const links = useMemo(() => {
    if (status.course === 'loaded' && status.sequence === 'loaded') {
      return [section, sequence].map((node) => ({
        id: node.id,
        label: node.title,
        url: `${getConfig().LMS_BASE_URL}/courses/${course.id}/course/#${node.id}`,
      }));
    }
    return [];
  }, [status]);

  return (
    <nav aria-label="breadcrumb" className="my-4">
      <ol className="list-unstyled d-flex m-0">
        <CourseBreadcrumb
          url={`${getConfig().LMS_BASE_URL}/courses/${course.id}/course/`}
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
  status: statusShape.isRequired,
  course: courseShape.isRequired,
  section: sectionShape,
  sequence: sequenceShape,
};

CourseBreadcrumbs.defaultProps = {
  section: undefined,
  sequence: undefined,
};
