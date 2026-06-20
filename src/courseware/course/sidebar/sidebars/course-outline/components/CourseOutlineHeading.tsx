import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, IconButton } from '@openedx/paragon';
import {
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@openedx/paragon/icons';
import messages from '../messages';

export interface CourseOutlineHeadingProps {
  isDisplaySequenceLevel: boolean;
  backButton?: {
    title: string;
    onClick: () => void;
  }
  onToggleCollapse?: () => void;
}

export const CourseOutlineHeading = ({
  isDisplaySequenceLevel,
  backButton,
  onToggleCollapse,
}: CourseOutlineHeadingProps) => {
  const intl = useIntl();
  return (
    <div
      className="outline-sidebar-heading-wrapper sticky d-flex justify-content-between align-self-start align-items-center bg-light-200 p-2.5 pl-4"
    >
      {isDisplaySequenceLevel && backButton ? (
        <Button
          variant="link"
          iconBefore={ChevronLeftIcon}
          className="outline-sidebar-heading p-0 mb-0 text-left text-dark-500"
          onClick={backButton.onClick}
        >
          {backButton.title}
        </Button>
      ) : (
        <span className="outline-sidebar-heading mb-0 h4 text-dark-500">
          {intl.formatMessage(messages.courseOutlineTitle)}
        </span>
      )}
      {onToggleCollapse && (
        <IconButton
          alt={intl.formatMessage(messages.toggleCourseOutlineTrigger)}
          className="outline-sidebar-toggle-btn flex-shrink-0 text-dark bg-light-200"
          iconAs={MenuOpenIcon}
          onClick={onToggleCollapse}
        />
      )}
    </div>
  );
};
