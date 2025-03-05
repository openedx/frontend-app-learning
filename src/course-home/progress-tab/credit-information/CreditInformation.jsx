import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { CheckCircle, WarningFilled, WatchFilled } from '@openedx/paragon/icons';
import { Hyperlink, Icon } from '@openedx/paragon';
import { useContextId } from '../../../data/hooks';

import { useModel } from '../../../generic/model-store';
import { DashboardLink } from '../../../shared/links';

import messages from './messages';

const CreditInformation = () => {
  const intl = useIntl();
  const courseId = useContextId();

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
      eligibilityStatus = intl.formatMessage(messages.creditNotEligibleStatus, { creditLink });
      break;
    case 'eligible':
      eligibilityStatus = intl.formatMessage(messages.creditEligibleStatus, { dashboardLink, creditLink });
      break;
    case 'partial_eligible':
      eligibilityStatus = intl.formatMessage(messages.creditPartialEligibleStatus, { creditLink });
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
      <div className="row w-100 m-0" key={`requirement-${requirement.order}`}>
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
      <p>{eligibilityStatus}</p>
      {requirements}
    </>
  );
};

export default CreditInformation;
