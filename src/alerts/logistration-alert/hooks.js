/* eslint-disable import/prefer-default-export */
import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { ALERT_TYPES, useAlert } from '../../generic/user-messages';
import { useOutlineTabData } from '../../course-home/data/apiHooks';

const LogistrationAlert = React.lazy(() => import('./LogistrationAlert'));

export function useLogistrationAlert(courseId) {
  const { authenticatedUser } = useContext(AppContext);
  const outline = useOutlineTabData(courseId, { enabled: false }).data;
  const privateOutline = outline && outline.courseBlocks && !outline.courseBlocks.courses;
  /**
   * This alert should render if
   *    1. the user is not authenticated, AND
   *    2. the course is private.
   */
  const isVisible = authenticatedUser === null && privateOutline;

  useAlert(isVisible, {
    code: 'clientLogistrationAlert',
    topic: 'outline',
    dismissible: false,
    type: ALERT_TYPES.ERROR,
  });

  return { clientLogistrationAlert: LogistrationAlert };
}
