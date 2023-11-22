import React from 'react';
import { Button, Icon } from '@edx/paragon';
import { ArrowForwardIos, ArrowBackIos } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import {
  getLocale, injectIntl, intlShape, isRtl,
} from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

const StartOrResumeCourseCard = ({ intl, title }) => {
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

  const isLocaleRtl = isRtl(getLocale());

  if (!resumeCourseUrl) {
    return null;
  }

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
    });
  };

  return (
    <div className="start-resume-card mb-4" data-testid="start-resume-card">
      <div className="title">
        <h2 className="h3">{title}</h2>
      </div>
      <Button
        variant="default"
        size="lg"
        href={resumeCourseUrl}
        onClick={() => logResumeCourseClick()}
      >
        {hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}
        <Icon src={isLocaleRtl ? ArrowBackIos : ArrowForwardIos} className="text-secondary ml-1" style={{ height: '16px', width: '16px' }} />
      </Button>
    </div>
  );
};

StartOrResumeCourseCard.propTypes = {
  title: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
