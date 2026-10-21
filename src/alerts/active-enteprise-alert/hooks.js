import React, { useMemo } from 'react';
import { ALERT_TYPES, useAlert } from '../../generic/user-messages';
import { useCourseHomeMeta } from '../../course-home/data/apiHooks';

const ActiveEnterpriseAlert = React.lazy(() => import('./ActiveEnterpriseAlert'));

export default function useActiveEnterpriseAlert(courseId) {
  const courseAccess = useCourseHomeMeta(courseId, { enabled: false }).data?.courseAccess;
  /**
   * This alert should render if
   *    1. course access code is incorrect_active_enterprise
   */
  const isVisible = courseAccess && !courseAccess.hasAccess && courseAccess.errorCode === 'incorrect_active_enterprise';

  const payload = useMemo(() => ({
    text: courseAccess && courseAccess.userMessage,
    courseId,
  }), [courseAccess, courseId]);
  useAlert(isVisible, {
    code: 'clientActiveEnterpriseAlert',
    topic: 'outline',
    dismissible: false,
    type: ALERT_TYPES.ERROR,
    payload,
  });

  return { clientActiveEnterpriseAlert: ActiveEnterpriseAlert };
}
