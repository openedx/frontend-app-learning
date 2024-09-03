import React, { useEffect, useState } from 'react';
import { LearningHeader as Header } from '@edx/frontend-component-header';
import { useModel } from '@src/generic/model-store';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tab, TabPane, Tabs, Toast, useToggle,
} from '@openedx/paragon';
import genericMessages from '@src/generic/messages';
import { setCallToActionToast } from '@src/course-home/data/slice';
import LaunchCourseHomeTourButton from '@src/product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';
import { fetchDatesTab, fetchOutlineTab, fetchProgressTab } from '@src/course-home/data';
import { useParams } from 'react-router-dom';
import PageLoading from '@src/generic/PageLoading';
import messages from '@src/tab-page/messages';
import FooterSlot from '@openedx/frontend-slot-footer';
import ProductTours from '@src/product-tours/ProductTours';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import InstructorToolbar from '@src/instructor-toolbar';
import StreakModal from '@src/shared/streak-celebration/StreakCelebrationModal';
import { AlertList } from '@src/generic/user-messages';
import useLogistrationAlert from '@src/alerts/logistration-alert';
import useEnrollmentAlert from '@src/alerts/enrollment-alert';
import OutlineTab from '@src/course-home/outline-tab/OutlineTab';
import DatesTab from '@src/course-home/dates-tab';
import { fetchDiscussionTab, fetchLiveTab } from '@src/course-home/data/thunks';
import ProgressTab from '@src/course-home/progress-tab/ProgressTab';
import PropTypes from 'prop-types';
import DiscussionTab from '@src/course-home/discussion-tab/DiscussionTab';

const TabComponents = {
  outline: (activeTab) => ((activeTab === 'outline') ? <OutlineTab /> : <></>),
  dates: (activeTab) => ((activeTab === 'dates') ? <DatesTab /> : <></>),
  progress: (activeTab) => ((activeTab === 'progress') ? <ProgressTab /> : <></>),
  discussion: (activeTab) => ((activeTab === 'discussion') ? <DiscussionTab /> : <></>),
};
const CoursewarePage = ({ intl, activeKey }) => {
  const dispatch = useDispatch();
  const [activeTabSlug, setActiveTab] = useState(activeKey);
  const metadataModel = 'courseHomeMeta';
  const unitId = null;
  const { courseId: courseIdFromUrl } = useParams();
  useEffect(() => {
    dispatch(fetchOutlineTab(courseIdFromUrl));
    dispatch(fetchDatesTab(courseIdFromUrl));
    dispatch(fetchLiveTab(courseIdFromUrl));
    dispatch(fetchDiscussionTab(courseIdFromUrl));
  }, [courseIdFromUrl]);
  const {
    courseId,
    courseStatus,
  } = useSelector(state => state.courseHome);
  const {
    toastBodyLink,
    toastBodyText,
    toastHeader,
  } = useSelector(state => state.courseHome);

  // Logistration and enrollment alerts are only really used for the outline tab, but loaded here to put them above
  // breadcrumbs when they are visible.
  const logistrationAlert = useLogistrationAlert(courseId);
  const enrollmentAlert = useEnrollmentAlert(courseId);

  const {
    number,
    org,
    title,
    celebrations,
    originalUserIsStaff,
    tabs,
    verifiedMode,
  } = useModel('courseHomeMeta', courseIdFromUrl, courseId);

  const activeTab = tabs ? tabs[0] : {};

  const streakLengthToCelebrate = celebrations && celebrations.streakLengthToCelebrate;
  const streakDiscountCouponEnabled = celebrations && celebrations.streakDiscountEnabled && verifiedMode;
  const [isStreakCelebrationOpen, , closeStreakCelebration] = useToggle(streakLengthToCelebrate);

  return (
    <>

      {['loaded', 'denied'].includes(courseStatus) && (
        <>
          <Toast
            action={toastBodyText ? {
              label: toastBodyText,
              href: toastBodyLink,
            } : null}
            closeLabel={intl.formatMessage(genericMessages.close)}
            onClose={() => dispatch(setCallToActionToast({ header: '', link: null, link_text: null }))}
            show={!!(toastHeader)}
          >
            {toastHeader}
          </Toast>
          <LaunchCourseHomeTourButton srOnly />
        </>
      )}

      <Header courseOrg={org} courseNumber={number} courseTitle={title} />
      {courseStatus === 'loading' && (
        <PageLoading srMessage={intl.formatMessage(messages.loading)} />
      )}

      {org && (
      <ProductTours
        activeTab={activeTabSlug}
        courseId={courseIdFromUrl}
        isStreakCelebrationOpen={isStreakCelebrationOpen}
        org={org}
      />
      )}
      <Helmet>
        <title>{`${activeTab ? `${activeTab.title} | ` : ''}${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      {originalUserIsStaff && (
        <InstructorToolbar
          courseId={courseIdFromUrl}
          unitId={unitId}
          tab={activeTabSlug}
        />
      )}
      <StreakModal
        courseId={courseIdFromUrl}
        metadataModel={metadataModel}
        streakLengthToCelebrate={streakLengthToCelebrate}
        isStreakCelebrationOpen={!!isStreakCelebrationOpen}
        closeStreakCelebration={closeStreakCelebration}
        streakDiscountCouponEnabled={streakDiscountCouponEnabled}
        verifiedMode={verifiedMode}
      />
      <main id="main-content" className="d-flex flex-column flex-grow-1">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...enrollmentAlert,
            ...logistrationAlert,
          }}
        />
        {(courseStatus === 'loaded' && tabs) && (
        <Tabs
          variant="tabs"
          defaultActiveKey={activeKey}
          id="uncontrolled-tab-example"
          style={{ marginLeft: '64px', marginRight: '64px' }}
          onSelect={(_activeKey) => {
            if (_activeKey === 'teams' || _activeKey === 'instructor') {
              window.location.replace(tabs.filter(t => (t.slug === _activeKey))[0].url);
              return;
            }
            if (_activeKey === 'progress') { dispatch(fetchProgressTab(courseIdFromUrl)); }
            setActiveTab(_activeKey);
          }}
        >
          { tabs?.map(tab => (
            <Tab eventKey={tab.slug} title={tab.title} href={tab.slug}>
              <TabPane style={{ margin: '64px', marginRight: '64px' }}>
                {TabComponents[tab.slug] && TabComponents[tab.slug](activeTabSlug)}
              </TabPane>
            </Tab>
          ))}
        </Tabs>
        )}
      </main>

      {/* courseStatus 'failed' and any other unexpected course status. */}
      {(!['loading', 'loaded', 'denied'].includes(courseStatus)) && (
        <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
          {intl.formatMessage(messages.failure)}
        </p>
      )}
      <FooterSlot />
    </>
  );
};

CoursewarePage.defaultProps = {
  // unitId: null,
};

CoursewarePage.propTypes = {
  // activeTabSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  activeKey: PropTypes.string.isRequired,
  // courseStatus: PropTypes.string.isRequired,
  // unitId: PropTypes.string,
};

export default injectIntl(CoursewarePage);
