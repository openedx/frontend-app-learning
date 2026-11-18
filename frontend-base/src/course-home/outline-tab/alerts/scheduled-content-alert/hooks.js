import React, { useMemo } from 'react';

import { useAlert } from '../../../../generic/user-messages';
import { useCourseHomeMeta, useOutlineTabData } from '../../../data/apiHooks';
import { useDatesTabUrl } from '../../../../course-tabs/hooks';

const ScheduledContentAlert = React.lazy(() => import('./ScheduledCotentAlert'));

const useScheduledContentAlert = (courseId) => {
  const {
    courseBlocks: {
      courses,
    },
  } = useOutlineTabData(courseId, { enabled: false }).data;
  const datesTabLink = useDatesTabUrl();

  const hasScheduledContent = (
    !!courses
    && !!Object.values(courses).find(course => course.hasScheduledContent === true)
  );
  const isEnrolled = useCourseHomeMeta(courseId, { enabled: false }).data?.isEnrolled;
  const payload = useMemo(() => ({
    datesTabLink,
  }), [datesTabLink]);
  useAlert(hasScheduledContent && isEnrolled, {
    code: 'ScheduledContentAlert',
    payload,
    topic: 'outline-course-alerts',
  });

  return { ScheduledContentAlert };
};

export default useScheduledContentAlert;
