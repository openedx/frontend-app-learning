import { useContext, useState, useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, useToggle } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import {
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@openedx/paragon/icons';

import { useModel } from '../../../../../generic/model-store';
import { LOADING, LOADED } from '../../../../../course-home/data/slice';
import PageLoading from '../../../../../generic/PageLoading';
import {
  getCourseStatus, getSequenceId, getCourseOutline, getCourseOutlineStatus, getCoursewareOutlineSidebarSettings,
} from '../../../../data/selectors';
import { getCourseOutlineStructure } from '../../../../data/thunks';
import SidebarContext from '../../SidebarContext';
import { ID } from './CourseOutlineTrigger';
import SidebarSection from './SidebarSection';
import SidebarSequence from './SidebarSequence';
import messages from './messages';

const CourseOutlineTray = ({ intl }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [isDisplaySequenceLevel, setDisplaySequenceLevel, setDisplaySectionLevel] = useToggle(true);

  const dispatch = useDispatch();
  const { courseStatus } = useSelector(getCourseStatus);
  const activeSequenceId = useSelector(getSequenceId);
  const { sections = {}, sequences = {} } = useSelector(getCourseOutline);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);
  const { enabled: isEnabled } = useSelector(getCoursewareOutlineSidebarSettings);

  const {
    courseId,
    unitId,
    currentSidebar,
    toggleSidebar,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  const {
    sectionId: activeSectionId,
  } = useModel('sequences', activeSequenceId);

  const sectionsIds = Object.keys(sections);
  const sequenceIds = sections[selectedSection || activeSectionId]?.sequenceIds || [];
  const backButtonTitle = sections[selectedSection || activeSectionId]?.title;

  const handleToggleCollapse = () => {
    if (currentSidebar === ID) {
      toggleSidebar(null);
      window.sessionStorage.removeItem('showCourseOutlineSidebar');
    } else {
      toggleSidebar(ID);
      window.sessionStorage.setItem('showCourseOutlineSidebar', 'true');
    }
  };

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
    if (isEnabled && courseOutlineStatus !== LOADED) {
      dispatch(getCourseOutlineStructure(courseId));
    }
  }, [courseId, isEnabled]);

  if (!isEnabled) {
    return null;
  }

  if (courseStatus === LOADING || courseOutlineStatus === LOADING) {
    return (
      <section className="outline-sidebar flex-shrink-0 mr-4 min-vh-100 h-auto">
        {sidebarHeading}
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
      </section>
    );
  }

  return (
    <section
      className={classNames('outline-sidebar ', {
        'flex-shrink-0 mr-4 min-vh-100 h-auto': !shouldDisplayFullScreen,
        'bg-white m-0 fixed-top w-100 vh-100': shouldDisplayFullScreen,
      })}
    >
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
  );
};

CourseOutlineTray.propTypes = {
  intl: intlShape.isRequired,
};

CourseOutlineTray.ID = ID;

export default injectIntl(CourseOutlineTray);
