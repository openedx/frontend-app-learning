import React, { useMemo } from 'react';

import { useAlert } from '../../../../generic/user-messages';
import { useModel } from '../../../../generic/model-store';

const ScheduledContentAlert = React.lazy(() => import('./ScheduledCotentAlert'));

const useScheduledContentAlert = (courseId) => {
  const {
    courseBlocks: {
      courses,
    },
    datesWidget: {
      datesTabLink,
    },
  } = useModel('outline', courseId);

  const hasScheduledContent = (
    !!courses
    && !!Object.values(courses).find(course => course.hasScheduledContent === true)
  );
  const { isEnrolled } = useModel('courseHomeMeta', courseId);
  const payload = {
    datesTabLink,
  };
  useAlert(hasScheduledContent && isEnrolled, {
    code: 'ScheduledContentAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic: 'outline-course-alerts',
  });

  return { ScheduledContentAlert };
};

export default useScheduledContentAlert;
