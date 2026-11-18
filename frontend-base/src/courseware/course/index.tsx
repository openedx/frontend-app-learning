// https://github.com/openedx/frontend-app-learning/issues/2196
interface CourseProps {
  courseId?: string;
  sequenceId?: string;
  unitId?: string;
  nextSequenceHandler: () => void;
  previousSequenceHandler: () => void;
  unitNavigationHandler: () => void;
}

const Course = ({ courseId, sequenceId, unitId }: CourseProps) => (
  <main>
    <p>course: not yet ported</p>
    <ul>
      <li>{`courseId=${courseId}`}</li>
      <li>{`sequenceId=${sequenceId}`}</li>
      <li>{`unitId=${unitId}`}</li>
    </ul>
  </main>
);

export default Course;
