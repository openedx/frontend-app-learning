import React, { useMemo } from 'react';
import { ALERT_TYPES, useAlert } from '../../generic/user-messages';
import { useModel } from '../../generic/model-store';

const ActiveEnterpriseAlert = React.lazy(() => import('./ActiveEnterpriseAlert'));

export default function useActiveEnterpriseAlert(courseId) {
  const { courseAccess } = useModel('courseHomeMeta', courseId);
  /**
   * This alert should render if
   *    1. course access code is incorrect_active_enterprise
   */
  const isVisible = courseAccess && !courseAccess.hasAccess && courseAccess.errorCode === 'incorrect_active_enterprise';

  const payload = {
    text: courseAccess && courseAccess.userMessage,
    courseId,
  };
  useAlert(isVisible, {
    code: 'clientActiveEnterpriseAlert',
    topic: 'outline',
    dismissible: false,
    type: ALERT_TYPES.ERROR,
    payload: useMemo(() => payload, Object.values(payload).sort()),
  });

  return { clientActiveEnterpriseAlert: ActiveEnterpriseAlert };
}
