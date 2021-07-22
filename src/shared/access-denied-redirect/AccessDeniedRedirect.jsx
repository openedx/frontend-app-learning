import React from 'react';
import PropTypes from 'prop-types';
import { getLocale } from '@edx/frontend-platform/i18n';
import { Redirect } from 'react-router';
import { useModel } from '../../generic/model-store';

// This component inspects an access denied error and redirects to a /redirect/... path, which then renders a nice
// little message while the browser loads the next page.
// This is basically a frontend version of check_course_access_with_redirect in the backend.

function AccessDeniedRedirect(props) {
  const {
    courseId,
    metadataModel,
    unitId,
  } = props;

  const {
    courseAccess,
    start,
  } = useModel(metadataModel, courseId);

  let url = `/redirect/course-home/${courseId}`;
  switch (courseAccess.errorCode) {
    case 'audit_expired':
      url = `/redirect/dashboard?access_response_error=${courseAccess.additionalContextUserMessage}`;
      break;
    case 'course_not_started':
      // eslint-disable-next-line no-case-declarations
      const startDate = (new Intl.DateTimeFormat(getLocale())).format(new Date(start));
      url = `/redirect/dashboard?notlive=${startDate}`;
      break;
    case 'survey_required':
      url = `/redirect/survey/${courseId}`;
      break;
    case 'unfulfilled_milestones':
      url = '/redirect/dashboard';
      break;
    case 'microfrontend_disabled':
      // This code path is only used by the courseware right now. The course home tabs each have their own check for
      // this in the tab-specific API calls. In those cases, the API will return an http status code if the MFE version
      // of those tabs are disabled, rather than an access error like this. We could try to unify these approaches, but
      // hopefully the legacy code isn't around long enough for that to be worth it.
      if (unitId) {
        url = `/redirect/courseware/${courseId}/unit/${unitId}`;
      }
      break;
    case 'authentication_required':
    case 'enrollment_required':
    default:
  }
  return (
    <Redirect to={url} />
  );
}

AccessDeniedRedirect.defaultProps = {
  unitId: null,
};

AccessDeniedRedirect.propTypes = {
  courseId: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

export default AccessDeniedRedirect;
