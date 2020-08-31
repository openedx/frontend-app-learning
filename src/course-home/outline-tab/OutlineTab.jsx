import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { AlertList } from '../../generic/user-messages';

import CourseDates from './widgets/CourseDates';
import CourseGoalCard from './widgets/CourseGoalCard';
import CourseHandouts from './widgets/CourseHandouts';
import CourseTools from './widgets/CourseTools';
import LearningToast from '../../toast/LearningToast';
import messages from './messages';
import Section from './Section';
import UpdateGoalSelector from './widgets/UpdateGoalSelector';
import useAccessExpirationAlert from '../../alerts/access-expiration-alert';
import useCertificateAvailableAlert from './alerts/certificate-available-alert';
import useCourseEndAlert from './alerts/course-end-alert';
import useCourseStartAlert from './alerts/course-start-alert';
import useEnrollmentAlert from '../../alerts/enrollment-alert';
import useLogistrationAlert from '../../alerts/logistration-alert';
import useOfferAlert from '../../alerts/offer-alert';
import { useModel } from '../../generic/model-store';
import WelcomeMessage from './widgets/WelcomeMessage';

function OutlineTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    title,
    start,
    end,
    enrollmentStart,
    enrollmentEnd,
    enrollmentMode,
    isEnrolled,
  } = useModel('courses', courseId);

  const {
    courseBlocks: {
      courses,
      sections,
    },
    courseGoals: {
      goalOptions,
      selectedGoal,
    },
    courseExpiredHtml,
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },
    offerHtml,
  } = useModel('outline', courseId);

  const [courseGoalToDisplay, setCourseGoalToDisplay] = useState(selectedGoal);
  const [goalToastHeader, setGoalToastHeader] = useState(null);

  // Above the tab alerts (appearing in the order listed here)
  const logistrationAlert = useLogistrationAlert();
  const enrollmentAlert = useEnrollmentAlert(courseId);

  // Below the course title alerts (appearing in the order listed here)
  const offerAlert = useOfferAlert(offerHtml, 'outline-course-alerts');
  const accessExpirationAlert = useAccessExpirationAlert(courseExpiredHtml, 'outline-course-alerts');
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);

  const rootCourseId = Object.keys(courses)[0];
  const { sectionIds } = courses[rootCourseId];

  return (
    <>
      <AlertList
        topic="outline"
        className="mb-3"
        customAlerts={{
          ...enrollmentAlert,
          ...logistrationAlert,
        }}
      />
      <LearningToast
        header={goalToastHeader}
        onClose={() => setGoalToastHeader(null)}
        show={!!(goalToastHeader)}
      />
      <div className="d-flex justify-content-between mb-3">
        <div role="heading" aria-level="1" className="h4">{title}</div>
        {resumeCourseUrl && (
          <a className="btn btn-primary" href={resumeCourseUrl}>
            {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
          </a>
        )}
      </div>
      <div className="row">
        <div className="col col-12 col-md-8">
          {!courseGoalToDisplay && goalOptions && (
            <CourseGoalCard
              courseId={courseId}
              goalOptions={goalOptions}
              title={title}
              setGoalToDisplay={(newGoal) => { setCourseGoalToDisplay(newGoal); }}
              setGoalToastHeader={(newHeader) => { setGoalToastHeader(newHeader); }}
            />
          )}
          <WelcomeMessage courseId={courseId} />
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
          {sectionIds.map((sectionId) => (
            <Section
              key={sectionId}
              courseId={courseId}
              section={sections[sectionId]}
            />
          ))}
        </div>
        <div className="col col-12 col-md-4">
          {courseGoalToDisplay && goalOptions && (
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
          <CourseDates
            start={start}
            end={end}
            enrollmentStart={enrollmentStart}
            enrollmentEnd={enrollmentEnd}
            enrollmentMode={enrollmentMode}
            isEnrolled={isEnrolled}
            courseId={courseId}
          />
          <CourseHandouts
            courseId={courseId}
          />
        </div>
      </div>
    </>
  );
}

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
