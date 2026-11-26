import { useContext, useState, useCallback } from 'react';
import { sendTrackEvent } from '@openedx/frontend-base';

import { UserMessagesContext, ALERT_TYPES } from '@src/generic/user-messages';

import { postCourseEnrollment } from './data/api';

// Separated into its own file to avoid a circular dependency inside this directory

function useEnrollClickHandler(courseId, orgId, successText) {
  const [loading, setLoading] = useState(false);
  const { addFlash } = useContext(UserMessagesContext);
  const enrollClickHandler = useCallback(() => {
    setLoading(true);
    postCourseEnrollment(courseId).then(() => {
      // Shown after the reload, above the page, where the outline lists its page alerts.
      addFlash({
        dismissible: true,
        flash: true,
        text: successText,
        type: ALERT_TYPES.SUCCESS,
        topic: 'outline',
      });
      setLoading(false);
      sendTrackEvent('edx.bi.user.course-home.enrollment', {
        org_key: orgId,
        courserun_key: courseId,
      });
      global.location.reload();
    });
  }, [addFlash, courseId, orgId, successText]);

  return { enrollClickHandler, loading };
}

export default useEnrollClickHandler;
