import React from 'react';
import { useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useModel } from '../../generic/model-store';

export default function ProgressTab() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const { administrator, username } = getAuthenticatedUser();

  const {
    enrollmentMode,
  } = useModel('progress', courseId);

  return (
    <section>
      <h2 className="mb-4">
        the user is {username} and they are enrolled as an {enrollmentMode} learner
        {administrator
        && <div>the user is admin</div>}
      </h2>
    </section>
  );
}
