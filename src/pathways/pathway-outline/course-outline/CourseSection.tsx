import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Stack } from '@openedx/paragon';
import { Minus, Plus } from '@openedx/paragon/icons';

import type { CourseSectionData } from '@src/pathways/data/types';

import { CompletionIcon } from './CompletionIcon';
import { CourseSubsection } from './CourseSubsection';
import messages from './messages';

export interface CourseSectionProps {
  courseId: string;
  section: CourseSectionData;
}

export const CourseSection = ({ courseId, section }: CourseSectionProps) => {
  const intl = useIntl();

  return (
    <li>
      <Collapsible
        styling="card-lg"
        className="learning-pathway-course-section bg-light-200"
        title={(
          <Stack direction="horizontal" gap={3}>
            <CompletionIcon complete={section.complete} />
            <span className="font-weight-bold">
              {section.displayName}
              <span className="sr-only">
                {`, ${intl.formatMessage(section.complete ? messages.completedSection : messages.incompleteSection)}`}
              </span>
            </span>
          </Stack>
        )}
        iconWhenClosed={<Icon src={Plus} aria-hidden />}
        iconWhenOpen={<Icon src={Minus} aria-hidden />}
      >
        <ul className="list-unstyled mb-0">
          {section.subsections.map((subsection) => (
            <CourseSubsection key={subsection.id} courseId={courseId} subsection={subsection} />
          ))}
        </ul>
      </Collapsible>
    </li>
  );
};
