import React from 'react';
import { Switch, Route } from 'react-router';

import CourseContainer from './CourseContainer';

export default function LearningSequencePage() {
  // In spirit, we determine which sort of course we're rendering here based on the URL parameters.
  // Currently we only have one type, so this file doesn't have much to do.
  return (
    <Route
      path={[
        '/course/:courseUsageKey/:sequenceId/:unitId',
        '/course/:courseUsageKey/:sequenceId',
        '/course/:courseUsageKey',
       ]}
      component={CourseContainer}
    />
  );
}
