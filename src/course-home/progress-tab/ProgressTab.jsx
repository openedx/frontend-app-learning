import React from 'react';
import { useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useModel } from '../../generic/model-store';
import Chapter from './Chapter';

export default function ProgressTab() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const { administrator, username } = getAuthenticatedUser();

  const {
    enrollmentMode,
    coursewareSummary,
  } = useModel('progress', courseId);

  return (
    <section>
      {enrollmentMode} {administrator} {username}
      {coursewareSummary.map((chapter) => (
        <Chapter
          key={chapter.displayName}
          chapter={chapter}
        />
      ))}
    </section>
  );
}
