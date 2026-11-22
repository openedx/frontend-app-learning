import { generatePath, Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import { DECODE_ROUTES } from '@src/constants';
import type { CourseSubsectionData } from '@src/pathways/data/types';

import { CompletionIcon } from './CompletionIcon';
import messages from './messages';

const SUBSECTION_ROUTE = DECODE_ROUTES.COURSEWARE[1];

export interface CourseSubsectionProps {
  courseId: string;
  subsection: CourseSubsectionData;
}

export const CourseSubsection = ({ courseId, subsection }: CourseSubsectionProps) => {
  const intl = useIntl();

  return (
    <Stack as="li" direction="horizontal" gap={3} className="py-2">
      <CompletionIcon complete={subsection.complete} />
      <Link to={generatePath(SUBSECTION_ROUTE, { courseId, sequenceId: subsection.id })}>
        {subsection.displayName}
        <span className="sr-only">
          {`, ${intl.formatMessage(subsection.complete ? messages.completedSubsection : messages.incompleteSubsection)}`}
        </span>
      </Link>
    </Stack>
  );
};
