import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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
import usePrivateCourseAlert from '../../alerts/private-course-alert';
import { useModel } from '../../generic/model-store';
import WelcomeMessage from './widgets/WelcomeMessage';

function OutlineTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    title,
  } = useModel('courses', courseId);

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

  // Below the course title alerts (appearing in the order listed here)
  const offerAlert = useOfferAlert(offer, userTimezone, 'outline-course-alerts');
  const accessExpirationAlert = useAccessExpirationAlert(accessExpiration, userTimezone, 'outline-course-alerts');
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);
  const privateCourseAlert = usePrivateCourseAlert(courseId);

  const rootCourseId = courses && Object.keys(courses)[0];

  const courseSock = useRef(null);

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
            <a className="btn btn-primary btn-block" href={resumeCourseUrl}>
              {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
            </a>
          </div>
        )}
      </div>
      <div className="row">
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
              ...accessExpirationAlert,
              ...certificateAvailableAlert,
              ...courseEndAlert,
              ...courseStartAlert,
              ...offerAlert,
            }}
          />
          {courseDateBlocks && (
            <DatesBannerContainer
              courseDateBlocks={courseDateBlocks}
              datesBannerInfo={datesBannerInfo}
              hasEnded={hasEnded}
              model="outline"
              tabFetch={fetchOutlineTab}
            />
          )}
          {!courseGoalToDisplay && goalOptions.length > 0 && (
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
            {courseGoalToDisplay && goalOptions.length > 0 && (
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
            <UpgradeCard
              courseId={courseId}
              onLearnMore={canShowUpgradeSock ? () => { courseSock.current.showToUser(); } : null}
            />
            <CourseDates
              courseId={courseId}
            />
            <CourseHandouts
              courseId={courseId}
            />
          </div>
        )}
      </div>
      {canShowUpgradeSock && <CourseSock ref={courseSock} offer={offer} verifiedMode={verifiedMode} />}
    </>
  );
}

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
