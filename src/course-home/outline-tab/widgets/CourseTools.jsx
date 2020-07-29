import React from 'react';
import PropTypes from 'prop-types';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark, faCertificate, faInfo, faCalendar, faStar,
} from '@fortawesome/free-solid-svg-icons';
import { faNewspaper } from '@fortawesome/free-regular-svg-icons';

import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function CourseTools({ courseId, intl }) {
  const {
    courseTools,
  } = useModel('outline', courseId);

  const logClick = (analyticsId) => {
    const { administrator } = getAuthenticatedUser();
    sendTrackEvent('edx.course.tool.accessed', {
      course_id: courseId,
      is_staff: administrator,
      tool_name: analyticsId,
    });
  };

  const renderIcon = (iconClasses) => {
    switch (iconClasses) {
      case 'edx.bookmarks':
        return faBookmark;
      case 'edx.tool.verified_upgrade':
        return faCertificate;
      case 'edx.tool.financial_assistance':
        return faInfo;
      case 'edx.calendar-sync':
        return faCalendar;
      case 'edx.updates':
        return faNewspaper;
      case 'edx.reviews':
        return faStar;
      default:
        return null;
    }
  };

  return (
    <section className="mb-3">
      <h2 className="h6">{intl.formatMessage(messages.tools)}</h2>
      {courseTools.map((courseTool) => (
        <div key={courseTool.analyticsId}>
          <a href={courseTool.url} onClick={() => logClick(courseTool.analyticsId)}>
            <FontAwesomeIcon icon={renderIcon(courseTool.analyticsId)} className="mr-2" style={{ width: '20px' }} />
            {courseTool.title}
          </a>
        </div>
      ))}
    </section>
  );
}

CourseTools.propTypes = {
  courseId: PropTypes.string,
  intl: intlShape.isRequired,
};

CourseTools.defaultProps = {
  courseId: null,
};

export default injectIntl(CourseTools);
