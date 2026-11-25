import { useRef } from 'react';

import {
  CoursewareSearch, CoursewareSearchProvider, CoursewareSearchToggle,
} from '@src/course-home/courseware-search';
import { useCoursewareSearchFeatureFlag } from '@src/course-home/courseware-search/hooks';

// The search button sits in the shell's course bar, and the panel opens under the bar's top edge: the panel is placed
// against this widget's own wrapper, since the course bar offers no stable element to measure.
const CoursewareSearchWidget = () => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const enabled = useCoursewareSearchFeatureFlag();

  if (!enabled) {
    return null;
  }

  return (
    <CoursewareSearchProvider>
      <div ref={anchorRef} className="ml-auto flex-grow-0 text-right text-nowrap">
        <CoursewareSearchToggle />
      </div>
      <CoursewareSearch anchorRef={anchorRef} />
    </CoursewareSearchProvider>
  );
};

export default CoursewareSearchWidget;
