import { useState } from 'react';
import classNames from 'classnames';
import { Button, useToggle, IconButton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@openedx/paragon/icons';

import { useModel } from '@src/generic/model-store';
import { LOADING } from '@src/constants';
import PageLoading from '@src/generic/PageLoading';
import SidebarSection from './components/SidebarSection';
import SidebarSequence from './components/SidebarSequence';
import { ID } from './constants';
import { useCourseOutlineSidebar } from './hooks';
import messages from './messages';

const CourseOutlineTray = () => {
  const intl = useIntl();
  const [selectedSection, setSelectedSection] = useState(null);
  const [isDisplaySequenceLevel, setDisplaySequenceLevel, setDisplaySectionLevel] = useToggle(true);

  const {
    courseId,
    unitId,
    isEnabledSidebar,
    currentSidebar,
    handleToggleCollapse,
    isActiveEntranceExam,
    shouldDisplayFullScreen,
    courseOutlineStatus,
    activeSequenceId,
    sections,
    sequences,
  } = useCourseOutlineSidebar();

  const {
    sectionId: activeSectionId,
  } = useModel('sequences', activeSequenceId);

  const sectionsIds = Object.keys(sections);
  const sequenceIds = sections[selectedSection || activeSectionId]?.sequenceIds || [];
  const backButtonTitle = sections[selectedSection || activeSectionId]?.title;

  const handleBackToSectionLevel = () => {
    setDisplaySectionLevel();
    setSelectedSection(null);
  };

  const handleSelectSection = (id) => {
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
      <IconButton
        alt={intl.formatMessage(messages.toggleCourseOutlineTrigger)}
        className="outline-sidebar-toggle-btn flex-shrink-0 text-dark bg-light-200"
        iconAs={MenuOpenIcon}
        onClick={handleToggleCollapse}
      />
    </div>
  );

  if (!isEnabledSidebar || isActiveEntranceExam || currentSidebar !== ID) {
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
            ? sequenceIds.map((sequenceId) => (
              <SidebarSequence
                key={sequenceId}
                courseId={courseId}
                sequence={sequences[sequenceId]}
                defaultOpen={sequenceId === activeSequenceId}
                activeUnitId={unitId}
              />
            ))
            : sectionsIds.map((sectionId) => (
              <SidebarSection
                key={sectionId}
                courseId={courseId}
                section={sections[sectionId]}
                handleSelectSection={handleSelectSection}
              />
            ))}
        </ol>
      </section>
    </div>
  );
};

CourseOutlineTray.ID = ID;

export default CourseOutlineTray;
