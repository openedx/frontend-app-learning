import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Button, Toast } from '@edx/paragon';
import { AlertList } from '../../generic/user-messages';

import CourseDates from './widgets/CourseDates';
import CourseGoalCard from './widgets/CourseGoalCard';
import CourseHandouts from './widgets/CourseHandouts';
import CourseSock from '../../generic/course-sock';
import CourseTools from './widgets/CourseTools';
import DatesBannerContainer from '../dates-banner/DatesBannerContainer';
import { fetchOutlineTab } from '../data';
import genericMessages from '../../generic/messages';
import messages from './messages';
import Section from './Section';
import UpdateGoalSelector from './widgets/UpdateGoalSelector';
import UpgradeCard from './widgets/UpgradeCard';
import useAccessExpirationAlert from '../../alerts/access-expiration-alert';
import useCertificateAvailableAlert from './alerts/certificate-available-alert';
import useCourseEndAlert from './alerts/course-end-alert';
import useCourseStartAlert from './alerts/course-start-alert';
import useOfferAlert from '../../alerts/offer-alert';
import usePrivateCourseAlert from './alerts/private-course-alert';
import { useModel } from '../../generic/model-store';
import WelcomeMessage from './widgets/WelcomeMessage';
import ProctoringInfoPanel from './widgets/ProctoringInfoPanel';

/** [MM-P2P] Experiment */
import { initHomeMMP2P, MMP2PFlyover } from '../../experiments/mm-p2p';

function OutlineTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
    title,
  } = useModel('courseHomeMeta', courseId);

  const {
    accessExpiration,
    canShowUpgradeSock,
    courseBlocks: {
      courses,
      sections,
    },
    courseGoals: {
      goalOptions,
      selectedGoal,
    },
    datesBannerInfo,
    datesWidget: {
      courseDateBlocks,
      userTimezone,
    },
    hasEnded,
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },
    offer,
    verifiedMode,
  } = useModel('outline', courseId);

  const [courseGoalToDisplay, setCourseGoalToDisplay] = useState(selectedGoal);
  const [goalToastHeader, setGoalToastHeader] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      courserun_key: courseId,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      org_key: org,
      url: resumeCourseUrl,
    });
  };

  // Below the course title alerts (appearing in the order listed here)
  const offerAlert = useOfferAlert(offer, userTimezone, 'outline-course-alerts');
  const accessExpirationAlert = useAccessExpirationAlert(accessExpiration, userTimezone, 'outline-course-alerts');
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);
  const privateCourseAlert = usePrivateCourseAlert(courseId);

  const rootCourseId = courses && Object.keys(courses)[0];

  const courseSock = useRef(null);

  /** [[MM-P2P] Experiment */
  const MMP2P = initHomeMMP2P(courseId);

  return (
    <>
      <Toast
        closeLabel={intl.formatMessage(genericMessages.close)}
        onClose={() => setGoalToastHeader('')}
        show={!!(goalToastHeader)}
      >
        {goalToastHeader}
      </Toast>
      <div className="row w-100 m-0 mb-3 justify-content-between">
        <div className="col-12 col-sm-auto p-0">
          <div role="heading" aria-level="1" className="h2">{title}</div>
        </div>
        {resumeCourseUrl && (
          <div className="col-12 col-sm-auto p-0">
            <Button block href={resumeCourseUrl} onClick={() => logResumeCourseClick()}>
              {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
            </Button>
          </div>
        )}
      </div>
      {/** [MM-P2P] Experiment (className for optimizely trigger) */}
      <div className="row course-outline-tab">
        <div className="col-12">
          <AlertList
            topic="outline-private-alerts"
            customAlerts={{
              ...privateCourseAlert,
            }}
          />
        </div>
        <div className="col col-12 col-md-8">
          { /** [MM-P2P] Experiment (the conditional) */ }
          { !MMP2P.state.isEnabled
            && (
            <AlertList
              topic="outline-course-alerts"
              className="mb-3"
              customAlerts={{
                ...accessExpirationAlert,
                ...certificateAvailableAlert,
                ...courseEndAlert,
                ...courseStartAlert,
                ...offerAlert,
              }}
            />
            )}
          {courseDateBlocks && (
            <DatesBannerContainer
              courseDateBlocks={courseDateBlocks}
              datesBannerInfo={datesBannerInfo}
              hasEnded={hasEnded}
              model="outline"
              tabFetch={fetchOutlineTab}
              /** [MM-P2P] Experiment */
              isMMP2PEnabled={MMP2P.state.isEnabled}
            />
          )}
          {!courseGoalToDisplay && goalOptions && goalOptions.length > 0 && (
            <CourseGoalCard
              courseId={courseId}
              goalOptions={goalOptions}
              title={title}
              setGoalToDisplay={(newGoal) => { setCourseGoalToDisplay(newGoal); }}
              setGoalToastHeader={(newHeader) => { setGoalToastHeader(newHeader); }}
            />
          )}
          <WelcomeMessage courseId={courseId} />
          {rootCourseId && (
            <>
              <div className="row w-100 m-0 mb-3 justify-content-end">
                <div className="col-12 col-sm-auto p-0">
                  <Button variant="outline-primary" block onClick={() => { setExpandAll(!expandAll); }}>
                    {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
                  </Button>
                </div>
              </div>
              <ol className="list-unstyled">
                {courses[rootCourseId].sectionIds.map((sectionId) => (
                  <Section
                    key={sectionId}
                    courseId={courseId}
                    defaultOpen={sections[sectionId].resumeBlock}
                    expand={expandAll}
                    section={sections[sectionId]}
                  />
                ))}
              </ol>
            </>
          )}
        </div>
        {rootCourseId && (
          <div className="col col-12 col-md-4">
            <ProctoringInfoPanel
              courseId={courseId}
            />
            {courseGoalToDisplay && goalOptions && goalOptions.length > 0 && (
              <UpdateGoalSelector
                courseId={courseId}
                goalOptions={goalOptions}
                selectedGoal={courseGoalToDisplay}
                setGoalToDisplay={(newGoal) => { setCourseGoalToDisplay(newGoal); }}
                setGoalToastHeader={(newHeader) => { setGoalToastHeader(newHeader); }}
              />
            )}
            <CourseTools
              courseId={courseId}
            />
            { /** [MM-P2P] Experiment (conditional) */ }
            { MMP2P.state.isEnabled
              ? <MMP2PFlyover isStatic options={MMP2P} />
              : (
                <UpgradeCard
                  courseId={courseId}
                  onLearnMore={
                    canShowUpgradeSock ? () => { courseSock.current.showToUser(); } : null
                  }
                />
              )}
            <CourseDates
              courseId={courseId}
              /** [MM-P2P] Experiment */
              mmp2p={MMP2P}
            />
            <CourseHandouts
              courseId={courseId}
            />
          </div>
        )}
      </div>
      {canShowUpgradeSock && (
        <CourseSock
          courseId={courseId}
          offer={offer}
          orgKey={org}
          pageLocation="Home Page"
          ref={courseSock}
          verifiedMode={verifiedMode}
        />
      )}
    </>
  );
}

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
