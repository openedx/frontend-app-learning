import React from 'react';

import { Redirect, useParams } from 'react-router-dom';

import CourseCelebration from './CourseCelebration';
import { useModel } from '../../../generic/model-store';

// These are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
const CELEBRATION_STATUSES = [
  'downloadable',
  'earned_but_not_available',
  'requesting',
  'unverified',
];

export default function CourseExit() {
  const { courseId } = useParams();
  const {
    courseExitPageIsActive,
    userHasPassingGrade,
    certificateData,
  } = useModel('courses', courseId);

  // userHasPassingGrade can be removed once there is an experience for failing learners
  if (!courseExitPageIsActive || !userHasPassingGrade) {
    return (<Redirect to={`/course/${courseId}`} />);
  }

  const {
    certStatus,
  } = certificateData;

  if (CELEBRATION_STATUSES.indexOf(certStatus) !== -1) {
    return (<CourseCelebration />);
  }
  // Just to be safe
  return (<Redirect to={`/course/${courseId}`} />);
}
