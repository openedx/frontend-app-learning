import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { history } from '@edx/frontend-platform';
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

  const [fromEmail, setFromEmail] = useState(false);
  const location = useLocation();

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

  if (!resumeCourseUrl) {
    return null;
  }

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
      from_email: fromEmail,
    });
  };

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const fromEmailQueryParam = Boolean(currentParams.get('from_email'));
    if (fromEmailQueryParam) {
      setFromEmail(true);

      // Deleting the from_email query param as it only needs to be set once
      // whenever passed in query params.
      currentParams.delete('from_email');
      history.replace({
        search: currentParams.toString(),
      });
    }
  }, [location.search]);

  return (
    <Card className="mb-3 raised-card" data-testid="start-resume-card">
      <Card.Header
        title={hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}
        actions={(
          <Button
            variant="brand"
            block
            href={resumeCourseUrl}
            onClick={() => logResumeCourseClick()}
          >
            {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
          </Button>
        )}
      />
      {/* Footer is needed for internal vertical spacing to work out. If you can remove, be my guest */}
      <Card.Footer><></></Card.Footer>
    </Card>
  );
}

StartOrResumeCourseCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
