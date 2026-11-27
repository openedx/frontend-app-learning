import { useIntl } from '@edx/frontend-platform/i18n';
import { Spinner, Stack } from '@openedx/paragon';

import { useCourseOutline } from '@src/pathways/data/apiHooks';

import { CourseSection } from './CourseSection';
import messages from './messages';

export interface CourseOutlineProps {
  courseId: string;
}

export const CourseOutline = ({ courseId }: CourseOutlineProps) => {
  const intl = useIntl();
  const { data: sections, isPending, isError } = useCourseOutline(courseId);

  if (isPending) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" screenReaderText={intl.formatMessage(messages.loading)} />
      </div>
    );
  }

  if (isError) {
    return <p className="mb-0 text-danger">{intl.formatMessage(messages.failure)}</p>;
  }

  return (
    <Stack as="ol" gap={2} className="list-unstyled mb-0">
      {sections.map((section) => (
        <CourseSection key={section.id} courseId={courseId} section={section} />
      ))}
    </Stack>
  );
};
