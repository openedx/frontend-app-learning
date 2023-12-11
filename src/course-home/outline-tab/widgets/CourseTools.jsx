import React from 'react';
import { useSelector } from 'react-redux';

import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCertificate, faInfo, faStar,
} from '@fortawesome/free-solid-svg-icons';
import { faNewspaper } from '@fortawesome/free-regular-svg-icons';
import { BookmarkIcon, NotificationIcon, AIIcon } from '../../../Icons';

import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import LaunchCourseHomeTourButton from '../../../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';

const CourseTools = ({ intl }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const { org } = useModel('courseHomeMeta', courseId);
  const {
    courseTools,
  } = useModel('outline', courseId);

  if (courseTools.length === 0) {
    return null;
  }

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const logClick = (analyticsId) => {
    const { administrator } = getAuthenticatedUser();
    sendTrackingLogEvent('edx.course.tool.accessed', {
      ...eventProperties,
      course_id: courseId, // should only be courserun_key, but left as-is for historical reasons
      is_staff: administrator,
      tool_name: analyticsId,
    });
  };

  const renderIcon = (iconClasses) => {
    switch (iconClasses) {
      case 'edx.bookmarks':
        return <BookmarkIcon className="mr-2 text-primary" />;
      case 'edx.tool.verified_upgrade':
        return <FontAwesomeIcon icon={faCertificate} className="mr-2 text-primary" fixedWidth />;
      case 'edx.tool.financial_assistance':
        return <FontAwesomeIcon icon={faInfo} className="mr-2 text-primary" fixedWidth />;
      case 'edx.calendar-sync':
        return <NotificationIcon className="mr-2 text-primary" />;
      case 'edx.updates':
        return <FontAwesomeIcon icon={faNewspaper} className="mr-2 text-primary" fixedWidth />;
      case 'edx.reviews':
        return <FontAwesomeIcon icon={faStar} className="mr-2 text-primary" fixedWidth />;
      default:
        return null;
    }
  };

  return (
    <section className="mb-4">
      <h2 className="h4">{intl.formatMessage(messages.tools)}</h2>
      <ul className="list-unstyled">
        {courseTools.map((courseTool) => (
          <li key={courseTool.analyticsId} className="small">
            <a href={courseTool.url} onClick={() => logClick(courseTool.analyticsId)}>
              {renderIcon(courseTool.analyticsId)}
              {courseTool.title}
            </a>
          </li>
        ))}
        <li className="small" id="courseHome-launchTourLink">
          <LaunchCourseHomeTourButton />
        </li>
        <li className="small" hidden id="aiMentor">
          <AIIcon className="mr-2 text-primary" />
          AI Mentor
        </li>
      </ul>
    </section>
  );
};

CourseTools.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseTools);
