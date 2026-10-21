import type { ReactNode } from 'react';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useMinimalCourseOutline, useSequenceMetadata } from '@src/courseware/data/apiHooks';

type QueryState = 'success' | 'pending';

interface CourseQueryStates {
  courseHomeMeta?: QueryState;
  coursewareMetadata?: QueryState;
  outline?: QueryState;
  sequence?: QueryState;
}

interface Props {
  courseId: string;
  sequenceId?: string;
  // The state each query must be in; by default the two TabPage waits for have succeeded.
  states?: CourseQueryStates;
  children?: ReactNode;
}

// Renders children only while the course's queries are in the given states, as TabPage renders
// the courseware only once its metadata queries have succeeded. The marker lets a test wait for
// the gate to open when the children render nothing.
const CourseQueryGate = ({
  courseId, sequenceId, states = {}, children,
}: Props) => {
  const queries = {
    courseHomeMeta: useCourseHomeMeta(courseId, { enabled: false }),
    coursewareMetadata: useCoursewareMetadata(courseId, { enabled: false }),
    outline: useMinimalCourseOutline(courseId, { enabled: false }),
    sequence: useSequenceMetadata(sequenceId, { enabled: false }),
  };
  const wanted: CourseQueryStates = { courseHomeMeta: 'success', coursewareMetadata: 'success', ...states };
  const isOpen = (Object.keys(wanted) as (keyof CourseQueryStates)[]).every((name) => (
    wanted[name] === 'success' ? queries[name].isSuccess : queries[name].isPending
  ));
  if (!isOpen) {
    return null;
  }
  return (
    <>
      <span hidden data-testid="course-query-gate-open" />
      {children}
    </>
  );
};

export default CourseQueryGate;
