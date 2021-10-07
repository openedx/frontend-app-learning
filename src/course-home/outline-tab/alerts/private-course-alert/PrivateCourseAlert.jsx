import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { Alert, Button, Hyperlink } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import enrollmentMessages from '../../../../alerts/enrollment-alert/messages';
import genericMessages from '../../../../generic/messages';
import messages from './messages';
import outlineMessages from '../../messages';
import useEnrollClickHandler from '../../../../alerts/enrollment-alert/clickHook';
import { useModel } from '../../../../generic/model-store';

function PrivateCourseAlert({ intl, payload }) {
  const {
    anonymousUser,
    canEnroll,
    courseId,
  } = payload;

  const {
    org,
    title,
  } = useModel('courseHomeMeta', courseId);

  const { enrollClickHandler, loading } = useEnrollClickHandler(
    courseId,
    org,
    intl.formatMessage(enrollmentMessages.success),
  );

  const enrollNowButton = (
    <Button
      disabled={loading}
      variant="link"
      className="p-0 border-0 align-top mr-1"
      style={{ textDecoration: 'underline' }}
      size="sm"
      onClick={enrollClickHandler}
    >
      {intl.formatMessage(enrollmentMessages.enrollNowInline)}
    </Button>
  );

  const register = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/register?next=${encodeURIComponent(global.location.href)}`}
    >
      {intl.formatMessage(genericMessages.registerLowercase)}
    </Hyperlink>
  );

  const signIn = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getLoginRedirectUrl(global.location.href)}`}
    >
      {intl.formatMessage(genericMessages.signInSentenceCase)}
    </Hyperlink>
  );

  return (
    <Alert variant="light" data-testid="private-course-alert">
      {anonymousUser && (
        <>
          <p className="font-weight-bold">
            {intl.formatMessage(enrollmentMessages.alert)}
          </p>
          <FormattedMessage
            id="learning.privateCourse.signInOrRegister"
            description="Prompts the user to sign in or register to see course content."
            defaultMessage="{signIn} or {register} and then enroll in this course."
            values={{
              signIn,
              register,
            }}
          />
        </>
      )}
      {!anonymousUser && (
        <>
          <p className="font-weight-bold">{intl.formatMessage(outlineMessages.welcomeTo)} {title}</p>
          {canEnroll && (
            <div className="d-flex">
              {enrollNowButton}
              {intl.formatMessage(messages.toAccess)}
              {loading && <FontAwesomeIcon icon={faSpinner} spin />}
            </div>
          )}
          {!canEnroll && (
            <>
              {intl.formatMessage(enrollmentMessages.alert)}
            </>
          )}
        </>
      )}
    </Alert>
  );
}

PrivateCourseAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    anonymousUser: PropTypes.bool,
    canEnroll: PropTypes.bool,
    courseId: PropTypes.string,
  }).isRequired,
};

export default injectIntl(PrivateCourseAlert);
