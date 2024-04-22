import { useContext } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { MenuOpen as MenuOpenIcon } from '@openedx/paragon/icons';

import { useModel } from '@src/generic/model-store';
import { getCoursewareOutlineSidebarSettings } from '../../../../data/selectors';
import { LAYOUT_LEFT } from '../../common/constants';
import SidebarContext from '../../SidebarContext';
import messages from './messages';

export const ID = 'COURSE_OUTLINE';
export const LAYOUT = LAYOUT_LEFT;

const CourseOutlineTrigger = ({ intl, isMobileView }) => {
  const {
    courseId,
    currentSidebar,
    toggleSidebar,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  const course = useModel('coursewareMeta', courseId);
  const {
    entranceExamEnabled,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const { enabled: isEnabled } = useSelector(getCoursewareOutlineSidebarSettings);
  const isDisplayForDesktopView = !isMobileView && !shouldDisplayFullScreen && currentSidebar !== ID;
  const isDisplayForMobileView = isMobileView && shouldDisplayFullScreen;
  const isActiveEntranceExam = entranceExamEnabled && !entranceExamPassed;

  if ((!isDisplayForDesktopView && !isDisplayForMobileView) || !isEnabled || isActiveEntranceExam) {
    return null;
  }

  const handleToggleCollapse = () => {
    if (currentSidebar === ID) {
      toggleSidebar(null);
      window.sessionStorage.setItem('hideCourseOutlineSidebar', 'true');
    } else {
      toggleSidebar(ID);
      window.sessionStorage.removeItem('hideCourseOutlineSidebar');
    }
  };

  return (
    <div className={classNames('outline-sidebar-heading-wrapper bg-light-200 collapsed align-self-start', {
      'flex-shrink-0 mr-4 p-2.5': isDisplayForDesktopView,
      'p-0': isDisplayForMobileView,
    })}
    >
      <IconButton
        alt={intl.formatMessage(messages.toggleCourseOutlineTrigger)}
        className="outline-sidebar-toggle-btn flex-shrink-0 text-dark bg-light-200 rounded-0"
        iconAs={MenuOpenIcon}
        onClick={handleToggleCollapse}
      />
    </div>
  );
};

CourseOutlineTrigger.defaultProps = {
  isMobileView: false,
};

CourseOutlineTrigger.propTypes = {
  intl: intlShape.isRequired,
  isMobileView: PropTypes.bool,
};

export default injectIntl(CourseOutlineTrigger);
