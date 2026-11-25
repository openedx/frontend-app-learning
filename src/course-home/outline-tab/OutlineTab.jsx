import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthenticatedUser, sendTrackEvent, useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import CourseOutlineTabNotificationsSlot from '../../slots/CourseOutlineTabNotificationsSlot';
import { AlertList } from '../../generic/user-messages';

import CourseDates from './widgets/CourseDates';
import CourseHandouts from './widgets/CourseHandouts';
import StartOrResumeCourseCard from './widgets/StartOrResumeCourseCard';
import WeeklyLearningGoalCard from './widgets/WeeklyLearningGoalCard';
import CourseTools from './widgets/CourseTools';
import { useCourseHomeMeta, useOutlineTabData, useProctoringInfoData } from '../data/apiHooks';
import messages from './messages';
import ShiftDatesAlert from '../suggested-schedule-messaging/ShiftDatesAlert';
import UpgradeToShiftDatesAlert from '../suggested-schedule-messaging/UpgradeToShiftDatesAlert';
import useCertificateAvailableAlert from './alerts/certificate-status-alert';
import useCourseEndAlert from './alerts/course-end-alert';
import useCourseStartAlert from '../../alerts/course-start-alert';
import usePrivateCourseAlert from './alerts/private-course-alert';
import useScheduledContentAlert from './alerts/scheduled-content-alert';
import WelcomeMessage from './widgets/WelcomeMessage';
import ProctoringInfoPanel from './widgets/ProctoringInfoPanel';
import AccountActivationAlert from './alerts/logistration-alert/AccountActivationAlert';
import useEnrollmentAlert from './alerts/enrollment-alert';
import useLogistrationAlert from './alerts/logistration-alert';
import { useAccessExpirationMasqueradeBanner } from '../../alerts/access-expiration-alert';
import ProductTours from '../../product-tours/ProductTours';
import LaunchCourseHomeTourButton from '../../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';
import CourseHomeSectionOutlineSlot from '../../slots/CourseHomeSectionOutlineSlot';
import { TabWithTimer } from '../../tab-page';
import { CourseParamsProvider, useCourseId } from '../../generic/course-params';
import LearningWidgetProviders from '../../generic/LearningWidgetProviders';

const OutlineTabContent = () => {
  const intl = useIntl();
  const courseId = useCourseId();

  const {
    isSelfPaced,
    org,
    title,
    username,
  } = useCourseHomeMeta(courseId, { enabled: false }).data;
  const { isPending: isProctoringInfoPending } = useProctoringInfoData(courseId, username);

  const expandButtonRef = useRef();

  const {
    courseBlocks: {
      courses,
      sections,
    },
    courseGoals: {
      selectedGoal,
      weeklyLearningGoalEnabled,
    } = {},
    datesWidget: {
      courseDateBlocks,
    },
    datesBannerInfo,
    enableProctoredExams,
    hasEnded,
  } = useOutlineTabData(courseId, { enabled: false }).data;

  const [expandAll, setExpandAll] = useState(false);
  const navigate = useNavigate();

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  // Below the course title alerts (appearing in the order listed here)
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);
  const privateCourseAlert = usePrivateCourseAlert(courseId);
  const scheduledContentAlert = useScheduledContentAlert(courseId);

  const rootCourseId = courses && Object.keys(courses)[0];

  const hasDeadlines = courseDateBlocks && courseDateBlocks.some(x => x.dateType === 'assignment-due-date');

  const logUpgradeToShiftDatesLinkClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: 'personalized_learner_schedules',
      linkName: 'course_home_upgrade_shift_dates',
      linkType: 'button',
      pageName: 'course_home',
    });
  };

  const isEnterpriseUser = () => {
    const authenticatedUser = getAuthenticatedUser();
    const userRoleNames = authenticatedUser ? authenticatedUser.roles.map(role => role.split(':')[0]) : [];

    return userRoleNames.includes('enterprise_learner');
  };

  /** show post enrolment survey to only B2C learners */
  const learnerType = isEnterpriseUser() ? 'enterprise_learner' : 'b2c_learner';

  const location = useLocation();

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const startCourse = currentParams.get('start_course');
    if (startCourse === '1') {
      sendTrackEvent('enrollment.email.clicked.startcourse', {});

      // Deleting the course_start query param as it only needs to be set once
      // whenever passed in query params.
      currentParams.delete('start_course');
      navigate({
        pathname: location.pathname,
        search: `?${currentParams.toString()}`,
      }, { replace: true, preventScrollReset: true });
    }
  }, [location.search, location.pathname, navigate]);

  return (
    <>
      <div data-learner-type={learnerType} className="row w-100 mx-0 my-3 justify-content-between">
        <div className="col-12 col-sm-auto p-0">
          <div role="heading" aria-level="1" className="h2">{title}</div>
        </div>
      </div>
      <div className="row course-outline-tab">
        <AccountActivationAlert />
        <div className="col-12">
          <AlertList
            topic="outline-private-alerts"
            customAlerts={{
              ...privateCourseAlert,
            }}
          />
        </div>
        <div className="col col-12 col-md-8">
          <AlertList
            topic="outline-course-alerts"
            className="mb-3"
            customAlerts={{
              ...certificateAvailableAlert,
              ...courseEndAlert,
              ...courseStartAlert,
              ...scheduledContentAlert,
            }}
          />
          {isSelfPaced && hasDeadlines && (
            <>
              <ShiftDatesAlert model="outline" datesBannerInfo={datesBannerInfo} hasEnded={hasEnded} />
              <UpgradeToShiftDatesAlert
                logUpgradeLinkClick={logUpgradeToShiftDatesLinkClick}
                datesBannerInfo={datesBannerInfo}
                hasEnded={hasEnded}
              />
            </>
          )}
          <StartOrResumeCourseCard />
          <WelcomeMessage courseId={courseId} nextElementRef={expandButtonRef} />
          {rootCourseId && (
            <>
              <div id="expand-button-row" className="row w-100 m-0 mb-3 justify-content-end">
                <div className="col-12 col-md-auto p-0">
                  <Button
                    ref={expandButtonRef}
                    variant="outline-primary"
                    block
                    onClick={() => {
                      setExpandAll(!expandAll);
                    }}
                  >
                    {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
                  </Button>
                </div>
              </div>
              <CourseHomeSectionOutlineSlot
                courseId={courseId}
                expandAll={expandAll}
                sectionIds={courses[rootCourseId].sectionIds}
                sections={sections}
              />
            </>
          )}
        </div>
        {rootCourseId && (
          <div className="col col-12 col-md-4">
            <ProctoringInfoPanel />
            { /** Defer showing the goal widget until the ProctoringInfoPanel has resolved or has been determined as
             disabled to avoid components bouncing around too much as screen is rendered */ }
            {(!enableProctoredExams || !isProctoringInfoPending) && weeklyLearningGoalEnabled && (
              <WeeklyLearningGoalCard
                daysPerWeek={selectedGoal && 'daysPerWeek' in selectedGoal ? selectedGoal.daysPerWeek : null}
                subscribedToReminders={selectedGoal && 'subscribedToReminders' in selectedGoal ? selectedGoal.subscribedToReminders : false}
              />
            )}
            <CourseTools />
            <CourseOutlineTabNotificationsSlot courseId={courseId} />
            <CourseDates />
            <CourseHandouts />
          </div>
        )}
      </div>
    </>
  );
};

// Under the providers OutlineTab mounts: the alert hooks register with its user messages.
const OutlineTabFrame = ({ courseId }) => {
  const metadataQuery = useCourseHomeMeta(courseId);
  const tabDataQuery = useOutlineTabData(courseId);

  // Shown above the course title, so passed to the frame for its top alert region.
  const logistrationAlert = useLogistrationAlert(courseId);
  const enrollmentAlert = useEnrollmentAlert(courseId);
  const accessExpirationMasqueradeBanner = useAccessExpirationMasqueradeBanner(
    courseId,
    tabDataQuery.data?.accessExpiration,
  );

  return (
    <TabWithTimer
      courseId={courseId}
      courseStatus={{ metadataQuery, tabDataQuery }}
      // An unenrolled or anonymous learner sees the outline, with the alerts that ask them to enroll or sign in.
      showWhenDenied
      // The visible "launch tour" button is deep in the outline. Screen-reader users get a copy above the rest of the
      // page, where it won't be buried (https://github.com/openedx/frontend-app-learning/pull/750#discussion_r755536879).
      aboveContent={<LaunchCourseHomeTourButton srOnly />}
      pageAlerts={{ ...enrollmentAlert, ...logistrationAlert }}
      masqueradeBanners={accessExpirationMasqueradeBanner}
      renderTours={({ isStreakCelebrationOpen }) => (
        <ProductTours
          activeTab="outline"
          courseId={courseId}
          isStreakCelebrationOpen={isStreakCelebrationOpen}
          org={metadataQuery.data.org}
        />
      )}
    >
      <OutlineTabContent />
    </TabWithTimer>
  );
};

OutlineTabFrame.propTypes = {
  courseId: PropTypes.string.isRequired,
};

const OutlineTab = ({ courseId }) => (
  <LearningWidgetProviders>
    <CourseParamsProvider courseId={courseId}>
      <OutlineTabFrame courseId={courseId} />
    </CourseParamsProvider>
  </LearningWidgetProviders>
);

OutlineTab.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default OutlineTab;
