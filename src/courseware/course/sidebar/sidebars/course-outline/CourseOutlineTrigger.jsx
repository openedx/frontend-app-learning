import classNames from 'classnames';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { MenuOpen as MenuOpenIcon } from '@openedx/paragon/icons';

import { useCourseOutlineSidebar } from './hooks';
import { ID } from './constants';
import messages from './messages';

const CourseOutlineTrigger = ({ intl, isMobileView }) => {
  const {
    currentSidebar,
    shouldDisplayFullScreen,
    handleToggleCollapse,
    isActiveEntranceExam,
    isEnabledSidebar,
  } = useCourseOutlineSidebar();

  const isDisplayForDesktopView = !isMobileView && !shouldDisplayFullScreen && currentSidebar !== ID;
  const isDisplayForMobileView = isMobileView && shouldDisplayFullScreen;

  if ((!isDisplayForDesktopView && !isDisplayForMobileView) || !isEnabledSidebar || isActiveEntranceExam) {
    return null;
  }

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
