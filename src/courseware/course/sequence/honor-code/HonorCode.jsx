import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, getAuthenticatedUser, getSiteConfig, useAppConfig, useIntl,
} from '@openedx/frontend-base';
import { ActionRow, Alert, Button } from '@openedx/paragon';

import { useNavigate } from 'react-router-dom';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useSaveIntegritySignature } from '@src/courseware/data/apiHooks';
import { getCourseOutlineUrl } from '@src/courseware/urls';
import messages from './messages';

const HonorCode = ({ courseId }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const saveIntegritySignature = useSaveIntegritySignature();
  const {
    isMasquerading,
    username,
  } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};
  const authUser = getAuthenticatedUser();
  const { TERMS_OF_SERVICE_URL: termsOfServiceUrl } = useAppConfig();
  const siteName = getSiteConfig().siteName;
  const honorCodeName = intl.formatMessage(messages['learn.honorCode.name']);
  // Without a terms of service page to point at, the honor code is named but not linked.
  const honorCodeLink = termsOfServiceUrl ? <a href={`${termsOfServiceUrl}#honor-code`}>{honorCodeName}</a> : honorCodeName;

  const handleCancel = () => navigate(getCourseOutlineUrl(courseId));

  const handleAgree = () => saveIntegritySignature(
    // If the request is made by a staff user masquerading as a specific learner,
    // don't actually create a signature for them on the backend.
    // Only the modal dialog will be dismissed.
    // Otherwise, even for staff users, we want to record the signature.
    courseId,
    isMasquerading && username !== authUser.username,
  );

  return (
    <Alert variant="light" aria-live="off">
      <h4 aria-level="3">
        {siteName}{' '}
        {intl.formatMessage(messages['learn.honorCode.name'])}
      </h4>

      <p>
        <FormattedMessage
          id="learn.honorCode.content"
          defaultMessage="Honesty and academic integrity are important to {siteName} and the institutions providing courses and programs on the {siteName} site. By clicking “I agree” below, I confirm that I have read, understand, and will abide by the {link} for the {siteName} Site."
          values={{
            siteName,
            link: honorCodeLink,
          }}
          description="This is shown to learner, when course author wants to learners to explicity agree on their (Term of use or conduct), hence it links honor code page. "
        />
      </p>

      <ActionRow>
        <ActionRow.Spacer />
        <Button variant="tertiary" onClick={handleCancel}>
          {intl.formatMessage(messages['learn.honorCode.cancel'])}
        </Button>
        <Button variant="primary" onClick={handleAgree}>
          {intl.formatMessage(messages['learn.honorCode.agree'])}
        </Button>
      </ActionRow>
    </Alert>
  );
};

HonorCode.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default HonorCode;
