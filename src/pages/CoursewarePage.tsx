import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import { useParams } from 'react-router-dom';

import { useMinimalCourseOutline } from '@src/courseware/data/apiHooks';
import CoursewareTabSlot from '@src/slots/CoursewareTabSlot';
import CourseTabPage from './CourseTabPage';
import messages from './messages';

interface Props {
  // Set by the preview routes only.
  isPreview?: boolean;
}

/*
 * The document title of a unit: its breadcrumbs, from the course outline. The query shares the courseware's key, so it
 * makes no request of its own. Until the outline loads, the tab's title shows.
 */
const useCoursewareTitle = (courseId: string, sequenceId?: string) => {
  const { formatMessage } = useIntl();
  const { data: outline } = useMinimalCourseOutline(courseId);
  const courseTitle = outline?.courses[courseId]?.title;
  if (!outline || !courseTitle) {
    return undefined;
  }

  const { siteName } = getSiteConfig();
  const sequence = sequenceId ? outline.sequences[sequenceId] : undefined;
  const section = sequence?.sectionId ? outline.sections[sequence.sectionId] : undefined;
  if (sequence && section) {
    return formatMessage(messages['learning.courseware.page.title'], {
      sequenceTitle: sequence.title, sectionTitle: section.title, courseTitle, siteName,
    });
  }
  return formatMessage(messages['learning.course.page.title'], { courseTitle, siteName });
};

// The courseware routes' page: the route params go to the courseware tab's slot as props.
const CoursewarePage = ({ isPreview }: Props) => {
  const { courseId, sequenceId, unitId } = useParams() as { courseId: string; sequenceId?: string; unitId?: string };
  const title = useCoursewareTitle(courseId, sequenceId);
  return (
    <CourseTabPage courseId={courseId} tabSlug="courseware" title={title}>
      <CoursewareTabSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} isPreview={isPreview} />
    </CourseTabPage>
  );
};

export const PreviewCoursewarePage = () => <CoursewarePage isPreview />;

export default CoursewarePage;
