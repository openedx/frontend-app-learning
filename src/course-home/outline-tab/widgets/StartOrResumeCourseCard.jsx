import React from 'react';
import { Button, Card } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function StartOrResumeCourseCard({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const {
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },

  } = useModel('outline', courseId);

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
    });
  };

  return (
    <Card className="mb-3" data-testid="start-resume-card">
      <Card.Body>
        <div className="row w-100 m-0 justify-content-between">
          <h2 className="h4">{intl.formatMessage(messages.startBlurb)}</h2>
          <div className="col-12 col-md-auto p-0">
            <Button
              variant="brand"
              block
              href={resumeCourseUrl}
              onClick={() => logResumeCourseClick()}
            >
              {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

StartOrResumeCourseCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
