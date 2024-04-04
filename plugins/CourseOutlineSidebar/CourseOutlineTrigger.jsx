import { useContext, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { MenuOpen as MenuOpenIcon } from '@openedx/paragon/icons';

import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import { extendSidebars } from '@src/courseware/course/sidebar/sidebars';
import { OUTLINE_SIDEBAR } from './CourseOutlineTray';
import { ID } from './constants';
import messages from './messages';
import { useCourseOutlineSidebar } from './hooks';

const CourseOutlineTrigger = ({ intl, isMobileView }) => {
  const {
    currentSidebar,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  const {
    handleToggleCollapse, isActiveEntranceExam,
  } = useCourseOutlineSidebar();

  const isDisplayForDesktopView = !isMobileView && !shouldDisplayFullScreen && currentSidebar !== ID;
  const isDisplayForMobileView = isMobileView && shouldDisplayFullScreen;

  // Adding CourseOutlineSidebar to the list of all sidebars on the unit page
  // only when connecting CourseOutlineSidebar via PluginSlot.
  useEffect(() => {
    extendSidebars(ID, OUTLINE_SIDEBAR);
  }, []);

  if ((!isDisplayForDesktopView && !isDisplayForMobileView) || isActiveEntranceExam) {
    return null;
  }

  return (
    <div className={classNames('outline-sidebar-heading-wrapper bg-light-200 collapsed', {
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
