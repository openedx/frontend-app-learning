import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useQueryClient } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import { useLocation, useNavigate } from 'react-router-dom';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import { AlertList } from '@src/generic/user-messages';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useMinimalCourseOutline } from '@src/courseware/data/apiHooks';
import { LearnerToolsSlot } from '../../plugin-slots/LearnerToolsSlot';
import { SidebarProvider } from './sidebar/SidebarContext';
import { getEnabledWidgets } from './sidebar/defaultWidgets';
import { RightSidebarTriggerSlot } from '../../plugin-slots/RightSidebarTriggerSlot';
import { CelebrationModal, shouldCelebrateOnSectionLoad, WeeklyGoalCelebrationModal } from './celebration';
import ContentTools from './content-tools';
import Sequence from './sequence';
import { CourseOutlineMobileSidebarTriggerSlot } from '../../plugin-slots/CourseOutlineMobileSidebarTriggerSlot';
import { CourseBreadcrumbsSlot } from '../../plugin-slots/CourseBreadcrumbsSlot';

const Course = ({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
  windowWidth,
}) => {
  const coursewareMetadata = useCoursewareMetadata(courseId, { enabled: false }).data;
  const {
    celebrations,
    isStaff,
    originalUserIsStaff,
  } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};
  const minimalCourseOutlineQuery = useMinimalCourseOutline(courseId, { enabled: false });
  const minimalCourseOutline = minimalCourseOutlineQuery.data;
  const minimalCourseMetadata = minimalCourseOutline?.courses[courseId];
  const minimalSequenceMetadata = minimalCourseOutline?.sequences[sequenceId];
  const section = minimalSequenceMetadata && minimalCourseOutline.sections[minimalSequenceMetadata.sectionId];
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!originalUserIsStaff && pathname.startsWith('/preview')) {
    const courseUrl = pathname.replace('/preview', '');
    navigate(courseUrl, { replace: true });
  }

  const pageTitleBreadCrumbs = [
    minimalSequenceMetadata,
    section,
    minimalCourseMetadata,
  ].filter(element => element != null).map(element => element.title);

  const widgets = useMemo(() => getEnabledWidgets(), []);
  const queryClient = useQueryClient();

  const [firstSectionCelebrationOpen, setFirstSectionCelebrationOpen] = useState(false);
  // If streakLengthToCelebrate is populated, that modal takes precedence. Wait til the next load to display
  // the weekly goal celebration modal.
  const [weeklyGoalCelebrationOpen, setWeeklyGoalCelebrationOpen] = useState(
    celebrations && !celebrations.streakLengthToCelebrate && celebrations.weeklyGoal,
  );
  const shouldDisplayLearnerTools = windowWidth >= breakpoints.medium.minWidth;
  const daysPerWeek = coursewareMetadata?.courseGoals?.selectedGoal?.daysPerWeek;

  useEffect(() => {
    const celebrateFirstSection = celebrations && celebrations.firstSection;
    setFirstSectionCelebrationOpen(shouldCelebrateOnSectionLoad(
      courseId,
      sequenceId,
      celebrateFirstSection,
      queryClient,
      celebrations,
    ));
  }, [sequenceId]);

  return (
    <SidebarProvider courseId={courseId} unitId={unitId} widgets={widgets}>
      {minimalCourseOutlineQuery.isSuccess && (
        <Helmet>
          <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
        </Helmet>
      )}
      <div className="position-relative d-flex align-items-xl-center mb-4 mt-1 flex-column flex-xl-row">
        <CourseBreadcrumbsSlot
          courseId={courseId}
          sectionId={section ? section.id : null}
          sequenceId={sequenceId}
          isStaff={isStaff}
          unitId={unitId}
        />
        {shouldDisplayLearnerTools && (
          <LearnerToolsSlot
            enrollmentMode={coursewareMetadata.enrollmentMode}
            isStaff={isStaff}
            courseId={courseId}
            unitId={unitId}
          />
        )}
        <div className="w-100 d-flex align-items-center">
          <CourseOutlineMobileSidebarTriggerSlot />
          <RightSidebarTriggerSlot courseId={courseId} />
        </div>
      </div>

      <AlertList topic="sequence" />
      <Sequence
        unitId={unitId}
        sequenceId={sequenceId}
        courseId={courseId}
        unitNavigationHandler={unitNavigationHandler}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
      />
      <CelebrationModal
        courseId={courseId}
        isOpen={firstSectionCelebrationOpen}
        onClose={() => setFirstSectionCelebrationOpen(false)}
      />
      <WeeklyGoalCelebrationModal
        courseId={courseId}
        daysPerWeek={daysPerWeek}
        isOpen={weeklyGoalCelebrationOpen}
        onClose={() => setWeeklyGoalCelebrationOpen(false)}
      />
      <ContentTools course={coursewareMetadata} />
    </SidebarProvider>
  );
};

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

const CourseWrapper = (props) => {
  // useWindowSize initially returns an undefined width intentionally at first.
  // See https://www.joshwcomeau.com/react/the-perils-of-rehydration/ for why.
  // But <Course> has some tricky window-size-dependent, session-storage-setting logic and React would yell at us if
  // we exited that component early, before hitting all the useState() calls.
  // So just skip all that until we have a window size available.
  const windowWidth = useWindowSize().width;
  if (windowWidth === undefined) {
    return null;
  }

  return <Course {...props} windowWidth={windowWidth} />;
};

export default CourseWrapper;
