import { useContext, useState, useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, useToggle, IconButton } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@openedx/paragon/icons';

import { useModel } from '@src/generic/model-store';
import PageLoading from '@src/generic/PageLoading';
import { usePluginsSelector } from '@src/generic/plugin-store';
import { LOADED } from '@src/course-home/data/slice';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import { getSequenceId, getUnitsModel } from './data/selectors';
import SidebarSection from './SidebarSection';
import SidebarSequence from './SidebarSequence';
import messages from './messages';
import { ID, LAYOUT } from './constants';
import { useCourseOutlineSidebar } from './hooks';
import { getCourseOutlineStructure, updateCourseOutlineCompletion } from './data/thunks';

const CourseOutlineTray = ({ intl }) => {
  const [completedIds, setCompletedIds] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isDisplaySequenceLevel, setDisplaySequenceLevel, setDisplaySectionLevel] = useToggle(true);

  const dispatch = useDispatch();

  const {
    handleToggleCollapse, isActiveEntranceExam,
  } = useCourseOutlineSidebar();

  const activeSequenceId = useSelector(getSequenceId);
  const sequenceNavUnits = useSelector(getUnitsModel) || {};
  const {
    loadingStatus, courseOutlineShouldUpdate, structure: courseOutlineStructure,
  } = usePluginsSelector(ID);
  const { sections = {}, sequences = {} } = courseOutlineStructure ?? {};

  const {
    courseId,
    unitId,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  const {
    sectionId: activeSectionId,
  } = useModel('sequences', activeSequenceId);

  const sectionsIds = Object.keys(sections);
  const sequenceIds = sections[selectedSection || activeSectionId]?.sequenceIds || [];
  const backButtonTitle = sections[selectedSection || activeSectionId]?.title;
  const newCompletedUnitIds = Object.keys(sequenceNavUnits).filter((id) => sequenceNavUnits[id].complete);

  if (JSON.stringify(completedIds.sort()) !== JSON.stringify(newCompletedUnitIds.sort())) {
    setCompletedIds(newCompletedUnitIds);
  }

  const handleBackToSectionLevel = () => {
    setDisplaySectionLevel();
    setSelectedSection(null);
  };

  const handleSelectSection = (id) => {
    setDisplaySequenceLevel();
    setSelectedSection(id);
  };

  const sidebarHeading = (
    <div className="outline-sidebar-heading-wrapper d-flex justify-content-between align-items-center bg-light-200 p-2.5 pl-4">
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

  useEffect(() => {
    if (loadingStatus !== LOADED || courseOutlineShouldUpdate) {
      dispatch(getCourseOutlineStructure(courseId));
    }
  }, [courseId, courseOutlineShouldUpdate]);

  useEffect(() => {
    if (courseId && completedIds.length) {
      dispatch(updateCourseOutlineCompletion(completedIds));
    }
  }, [courseId, completedIds]);

  if (isActiveEntranceExam) {
    return null;
  }

  if (!loadingStatus) {
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

CourseOutlineTray.propTypes = {
  intl: intlShape.isRequired,
};

// CourseOutlineTray.ID = ID;

export default injectIntl(CourseOutlineTray);

export const OUTLINE_SIDEBAR = {
  ID,
  LAYOUT,
  Sidebar: injectIntl(CourseOutlineTray),
};
