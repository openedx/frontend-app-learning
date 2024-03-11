import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import SidebarTriggerBase from '../../common/TriggerBase';
import { LAYOUT_LEFT } from '../../common/constants';
import CourseOutlineIcon from './CourseOutlineIcon';
import messages from './messages';

export const ID = 'COURSE_OUTLINE';
export const LAYOUT = LAYOUT_LEFT;

const CourseOutlineTrigger = ({
  intl,
  onClick,
}) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <SidebarTriggerBase onClick={handleClick} ariaLabel={intl.formatMessage(messages.openCourseOutlineTrigger)}>
      <CourseOutlineIcon />
    </SidebarTriggerBase>
  );
};

CourseOutlineTrigger.propTypes = {
  intl: intlShape.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default injectIntl(CourseOutlineTrigger);
