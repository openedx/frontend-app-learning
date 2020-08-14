import React from 'react';
import { useSelector } from 'react-redux';

import {
  FormattedDate, FormattedTime, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import { useModel } from '../../generic/model-store';
import messages from './messages';

function CreditRequirements({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    creditCourseRequirements,
    creditSupportUrl,
    verificationData,
    userTimezone,
  } = useModel('progress', courseId);

  if (creditCourseRequirements === null) { return null; }
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};
  const eligibility = creditCourseRequirements.eligibilityStatus;
  let message;
  switch (eligibility) {
    case 'not_eligible':
      message = intl.formatMessage(messages.creditNotEligible);
      break;
    case 'eligible':
      message = intl.formatMessage(messages.creditEligible);
      break;
    case 'partial_eligible':
      message = intl.formatMessage(messages.creditPartialEligible);
      break;
    default:
      break;
  }

  const completed = `✓ ${intl.formatMessage(messages.completed)} `;

  const { status } = verificationData;
  let verificationMessage;
  let verificationLinkMessage = '';

  switch (status) {
    case 'none':
    case 'expired':
      verificationMessage = `${intl.formatMessage(messages.notStarted)}; `;
      verificationLinkMessage = intl.formatMessage(messages.notStarted);
      break;
    case 'approved':
      verificationMessage = completed;
      break;
    case 'pending':
      verificationMessage = intl.formatMessage(messages.pending);
      break;
    case 'must_reverify':
      verificationMessage = `${intl.formatMessage(messages.rejected)}; `;
      verificationLinkMessage = intl.formatMessage(messages.tryAgain);
      break;
    default:
      break;
  }
  return (
    <section className="banner rounded row border border-primary-300 my-2">
      <div className="col ml-4 my-3">
        <div className="row font-weight-bold">
          {intl.formatMessage(messages.courseCreditHeader)}
        </div>
        <div className="row mb-2">{message}</div>
        {creditCourseRequirements.requirements.map((requirement) => (
          <div key={requirement.displayName} className="row w-50 border-bottom">
            <div className="col-4">
              {requirement.displayName}
              {requirement.minGrade && (
                <span>{` ${requirement.minGrade}%`}</span>
              )}
            </div>
            <div className="col-8">
              {!requirement.status && (
                intl.formatMessage(messages.notMet)
              )}
              {(requirement.status === 'failed' || requirement.status === 'declined') && (
                intl.formatMessage(messages.failed)
              )}
              {requirement.status === 'submitted' && (
                intl.formatMessage(messages.submitted)
              )}
              {requirement.status === 'satisfied' && (
                <span>
                  {completed}
                  {requirement.statusDate && (
                    <span>
                      <FormattedDate
                        value={requirement.statusDate}
                        day="numeric"
                        month="short"
                        weekday="short"
                        year="numeric"
                        {...timezoneFormatArgs}
                      /> <FormattedTime
                        value={requirement.statusDate}
                      />
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="row w-50 border-bottom">
          <div className="col-4">Verification Status </div>
          <div className="col-8">
            {verificationMessage}
            {verificationLinkMessage && (
              <a href={verificationData.link}>{verificationLinkMessage}</a>
            )}
            {status === 'approved' && verificationData.statusDate && (
              <span>
                <FormattedDate
                  value={verificationData.statusDate}
                  day="numeric"
                  month="short"
                  weekday="short"
                  year="numeric"
                  {...timezoneFormatArgs}
                />
              </span>
            )}
          </div>
        </div>
        {eligibility === 'eligible' && (
          <div className="mt-3 row">
            <a className="btn btn-primary" href={creditCourseRequirements.dashboardUrl}>{intl.formatMessage(messages.purchaseCredit)}</a>
          </div>
        )}
        <div className="mt-3 row">
          <a href={creditSupportUrl}>{intl.formatMessage(messages.learnMoreCredit)}</a>
        </div>
      </div>
    </section>
  );
}

CreditRequirements.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CreditRequirements);
