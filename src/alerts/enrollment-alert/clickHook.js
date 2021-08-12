import { useContext, useState, useCallback } from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { UserMessagesContext, ALERT_TYPES } from '../../generic/user-messages';

import { postCourseEnrollment } from './data/api';

// Separated into its own file to avoid a circular dependency inside this directory

function useEnrollClickHandler(courseId, orgId, successText) {
  const [loading, setLoading] = useState(false);
  const { addFlash } = useContext(UserMessagesContext);
  const enrollClickHandler = useCallback(() => {
    setLoading(true);
    postCourseEnrollment(courseId).then(() => {
      addFlash({
        dismissible: true,
        flash: true,
        text: successText,
        type: ALERT_TYPES.SUCCESS,
        topic: 'course',
      });
      setLoading(false);
      sendTrackEvent('edx.bi.user.course-home.enrollment', {
        org_key: orgId,
        courserun_key: courseId,
      });
      global.location.reload();
    });
  }, [courseId]);

  return { enrollClickHandler, loading };
}

export default useEnrollClickHandler;
