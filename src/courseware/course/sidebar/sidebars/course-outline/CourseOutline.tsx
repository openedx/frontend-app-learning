import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, IconButton, useToggle } from '@openedx/paragon';
import { LOADING } from '@src/constants';
import {
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@openedx/paragon/icons';
import {
  useCourseOutlineData,
} from '@src/courseware/course/sidebar/sidebars/course-outline/hooks';
import PageLoading from '@src/generic/PageLoading';
import classNames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import SidebarSequence from './components/SidebarSequence';
import SidebarSection from './components/SidebarSection';
import messages from './messages';

interface CourseOutlineProps {
  shouldDisplayFullScreen?: boolean;
  onToggleCollapse?: () => void;
}

interface CoursePageParams extends Record<string, string> {
  courseId: string;
  unitId: string;
}

export const CourseOutline = ({
  shouldDisplayFullScreen = false,
  onToggleCollapse,
}: CourseOutlineProps) => {
  const intl = useIntl();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDisplaySequenceLevel, setDisplaySequenceLevel, setDisplaySectionLevel] = useToggle(true);
  const { unitId, courseId } = useParams<CoursePageParams>();
  const {
    courseOutlineStatus,
    activeSequenceId,
    sections,
    sequences,
    isActiveEntranceExam,
  } = useCourseOutlineData();

  const resolvedSectionId = selectedSection
        || Object.keys(sections).find(
          (sectionId):boolean => sections[sectionId].sequenceIds.includes(activeSequenceId),
        )!;
  const sectionsIds = Object.keys(sections);
  const sequenceIds: string[] = sections[resolvedSectionId]?.sequenceIds || [];
  const backButtonTitle: string | undefined = sections[resolvedSectionId]?.title;

  const handleBackToSectionLevel = () => {
    setDisplaySectionLevel();
    setSelectedSection(null);
  };

  const handleSelectSection = (id:string) => {
    setDisplaySequenceLevel();
    setSelectedSection(id);
  };
  const sidebarHeading = (
    <div className="outline-sidebar-heading-wrapper sticky d-flex justify-content-between align-self-start align-items-center bg-light-200 p-2.5 pl-4">
      {isDisplaySequenceLevel && backButtonTitle ? (
        <Button
          variant="link"
          iconBefore={ChevronLeftIcon}
          className="outline-sidebar-heading p-0 mb-0 text-left text-dark-500"
          onClick={handleBackToSectionLevel}
        >
          {backButtonTitle}
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
  if (isActiveEntranceExam) {
    return null;
  }
  if (courseOutlineStatus === LOADING) {
    return (
      <div className={classNames('outline-sidebar-wrapper', {
        'flex-shrink-0 mr-4 h-auto': !shouldDisplayFullScreen,
        'bg-white m-0 fixed-top w-100 vh-100': shouldDisplayFullScreen,
      })}
      >
        <section className="outline-sidebar w-100">
          {sidebarHeading}
          <PageLoading
            srMessage={intl.formatMessage(messages.loading)}
          />
        </section>
      </div>
    );
  }

  return (
    <div className={classNames('outline-sidebar-wrapper', {
      'flex-shrink-0 mr-4 h-auto': !shouldDisplayFullScreen,
      'bg-white m-0 fixed-top w-100 vh-100': shouldDisplayFullScreen,
    })}
    >
      <section className="outline-sidebar w-100">
        {sidebarHeading}
        <ol id="outline-sidebar-outline" className="list-unstyled">
          {isDisplaySequenceLevel
            ? sequenceIds.map((sequenceId: string) => (
              <SidebarSequence
                key={sequenceId}
                courseId={courseId!}
                sequence={sequences[sequenceId]}
                defaultOpen={sequenceId === activeSequenceId}
                activeUnitId={unitId!}
              />
            ))
            : sectionsIds.map((sectionId) => (
              <SidebarSection
                key={sectionId}
                section={sections[sectionId]}
                handleSelectSection={handleSelectSection}
              />
            ))}
        </ol>
      </section>
    </div>
  );
};
