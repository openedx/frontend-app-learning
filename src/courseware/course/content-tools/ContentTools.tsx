import type { CoursewareMeta } from '@src/courseware/data/coursewareMeta';

import Calculator from './calculator';
import NotesVisibility from './notes-visibility';

interface Props {
  course: CoursewareMeta;
}

const ContentTools = ({ course }: Props) => (
  <div className="content-tools">
    <div className="d-flex justify-content-end align-items-end m-0">
      {course.showCalculator && (
        <Calculator />
      )}
      {course.notes.enabled && (
        <NotesVisibility course={course} />
      )}
    </div>
  </div>
);

export default ContentTools;
