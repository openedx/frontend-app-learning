import React from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CheckCircle, WarningFilled, WatchFilled } from '@edx/paragon/icons';
import { Hyperlink, Icon } from '@edx/paragon';

import { useModel } from '../../../generic/model-store';
import { DashboardLink } from '../../../shared/links';

import messages from './messages';

function CreditInformation({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    creditCourseRequirements,
  } = useModel('progress', courseId);

  if (!creditCourseRequirements) { return null; }

  let eligibilityStatus;
  let requirementStatus;
  const requirements = [];
  const dashboardLink = <DashboardLink />;
  const creditLink = (
    <Hyperlink
      variant="muted"
      isInline
      destination={getConfig().CREDIT_HELP_LINK_URL}
    >{intl.formatMessage(messages.courseCredit)}
    </Hyperlink>
  );

  switch (creditCourseRequirements.eligibilityStatus) {
    case 'not_eligible':
      eligibilityStatus = (
        <FormattedMessage
          id="progress.creditInformation.creditNotEligible"
          defaultMessage="You are no longer eligible for credit in this course. Learn more about {creditLink}."
          description="Message to learner who are not eligible for course credit, it can because the a requirement deadline have passed"
          values={{ creditLink }}
        />
      );
      break;
    case 'eligible':
      eligibilityStatus = (
        <FormattedMessage
          id="progress.creditInformation.creditEligible"
          defaultMessage="
          You have met the requirements for credit in this course. Go to your
          {dashboardLink} to purchase course credit. Or learn more about {creditLink}."
          description="After the credit requirements are met, leaners can then do the last step which purchasing the credit. Note that is only doable for leaners after they met all the requirements"
          values={{ dashboardLink, creditLink }}
        />
      );
      break;
    case 'partial_eligible':
      eligibilityStatus = (
        <FormattedMessage
          id="progress.creditInformation.creditPartialEligible"
          defaultMessage="You have not yet met the requirements for credit. Learn more about {creditLink}."
          description="This means that one or more requirements is not satisfied yet"
          values={{ creditLink }}
        />
      );
      break;
    default:
      break;
  }
  creditCourseRequirements.requirements.forEach(requirement => {
    switch (requirement.status) {
      case 'submitted':
        requirementStatus = (<>{intl.formatMessage(messages.verificationSubmitted)} <Icon src={CheckCircle} className="text-success-500 d-inline-flex align-bottom" /></>);
        break;
      case 'failed':
      case 'declined':
        requirementStatus = (<>{intl.formatMessage(messages.verificationFailed)} <Icon src={WarningFilled} className="d-inline-flex align-bottom" /></>);
        break;
      case 'satisfied':
        requirementStatus = (<>{intl.formatMessage(messages.completed)} <Icon src={CheckCircle} className="text-success-500 d-inline-flex align-bottom" /></>);
        break;
      default:
        requirementStatus = (<>{intl.formatMessage(messages.upcoming)} <Icon src={WatchFilled} className="text-gray-500 d-inline-flex align-bottom" /></>);
    }
    requirements.push((
      <div className="row w-100 m-0 small" key={`requirement-${requirement.order}`}>
        <p className="font-weight-bold">
          {requirement.namespace === 'grade'
            ? `${intl.formatMessage(messages.minimumGrade, { minGrade: Number(requirement.criteria.minGrade) * 100 })}:`
            : `${requirement.displayName}:`}
        </p>
        <div className="ml-1">
          {requirementStatus}
        </div>
      </div>
    ));
  });

  return (
    <>
      <h3 className="h4 col-12 p-0">{intl.formatMessage(messages.requirementsHeader)}</h3>
      <p className="small">{eligibilityStatus}</p>
      {requirements}
    </>
  );
}

CreditInformation.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CreditInformation);
