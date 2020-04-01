import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useModel } from '../../model-store';

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
  courseId,
  sectionId,
  sequenceId,
}) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sectionId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  const links = useMemo(() => {
    if (courseStatus === 'loaded' && sequenceStatus === 'loaded') {
      return [section, sequence].filter(node => !!node).map((node) => ({
        id: node.id,
        label: node.title,
        url: `${getConfig().LMS_BASE_URL}/courses/${course.id}/course/#${node.id}`,
      }));
    }
    return [];
  }, [courseStatus, sequenceStatus]);

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
  courseId: PropTypes.string.isRequired,
  sectionId: PropTypes.string,
  sequenceId: PropTypes.string,
};

CourseBreadcrumbs.defaultProps = {
  sectionId: null,
  sequenceId: null,
};
