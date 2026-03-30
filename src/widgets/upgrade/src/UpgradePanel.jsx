import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import {
  useContext, useEffect, useMemo, useRef,
} from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import SidebarBase from '@src/courseware/course/sidebar/common/SidebarBase';
import { useModel } from '@src/generic/model-store';
import { useUpgradeWidgetContext } from './UpgradeWidgetContext';
import UpgradeTrigger, { ID } from './UpgradeTrigger';
import messages from './messages';

const UpgradePanel = () => {
  const intl = useIntl();
  const {
    courseId,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);
  const {
    onUpgradeWidgetSeen,
    upgradeCurrentState,
    setUpgradeCurrentState,
  } = useUpgradeWidgetContext();
  const course = useModel('coursewareMeta', courseId);

  const {
    end,
    enrollmentEnd,
    enrollmentMode,
    enrollmentStart,
    start,
    verificationStatus,
  } = course;

  const {
    courseModes,
    org,
    verifiedMode,
    username,
    isStaff,
  } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();
  const activeCourseModes = useMemo(() => courseModes?.map(mode => mode.slug), [courseModes]);

  const eventPropsRef = useRef(null);
  eventPropsRef.current = {
    course_end: end,
    course_modes: activeCourseModes,
    course_start: start,
    courserun_key: courseId,
    enrollment_end: enrollmentEnd,
    enrollment_mode: enrollmentMode,
    enrollment_start: enrollmentStart,
    is_upgrade_panel_visible: !!verifiedMode,
    name: 'Sidebar Upgrade Panel',
    org_key: org,
    username,
    verification_status: verificationStatus,
    is_staff: isStaff,
    is_admin: administrator,
  };

  useEffect(() => {
    sendTrackEvent('edx.ui.course.upgrade.sidebar.upgrade.panel', eventPropsRef.current);
    const timerId = setTimeout(() => onUpgradeWidgetSeen(), 3000);
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect
  }, []);

  return (
    <SidebarBase
      title={intl.formatMessage(messages.upgradeTitle)}
      ariaLabel={intl.formatMessage(messages.upgradePanel)}
      sidebarId={ID}
      width="45rem"
      className={classNames({
        'h-100': !verifiedMode && !shouldDisplayFullScreen,
        'ml-4': !shouldDisplayFullScreen,
      })}
    >
      <div>
        {verifiedMode ? (
          <PluginSlot
            id="org.openedx.frontend.learning.upgrade_panel.v1"
            pluginProps={{
              courseId,
              model: 'coursewareMeta',
              upgradeCurrentState,
              setUpgradeCurrentState,
            }}
          />
        ) : (
          <p className="p-3 small">{intl.formatMessage(messages.noUpgradeMessage)}</p>
        )}
      </div>
    </SidebarBase>
  );
};

UpgradePanel.Trigger = UpgradeTrigger;
UpgradePanel.ID = ID;

export default UpgradePanel;
