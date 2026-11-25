import PropTypes from 'prop-types';
import { useIntl } from '@openedx/frontend-base';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

import CourseExitDashboardFootnoteLinkSlot from '@src/slots/CourseExitSlots/CourseExitDashboardFootnoteLinkSlot';
import Footnote from './Footnote';
import messages from './messages';
import { useCourseId } from '@src/generic/course-params';

const DashboardFootnote = ({ variant }) => {
  const intl = useIntl();
  const courseId = useCourseId();
  const dashboardLink = (<CourseExitDashboardFootnoteLinkSlot courseId={courseId} variant={variant} />);

  return (
    <Footnote
      icon={faCalendarAlt}
      text={intl.formatMessage(messages.dashboardInfo, { dashboardLink })}
    />
  );
};

DashboardFootnote.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default DashboardFootnote;
