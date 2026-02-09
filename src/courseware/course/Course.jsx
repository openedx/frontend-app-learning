import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useLocation, useNavigate } from 'react-router-dom';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import { AlertList } from '@src/generic/user-messages';
import { useModel } from '@src/generic/model-store';
import { LearnerToolsSlot } from '../../plugin-slots/LearnerToolsSlot';
import SidebarProvider from './sidebar/SidebarContextProvider';
import NewSidebarProvider from './new-sidebar/SidebarContextProvider';
import { NotificationsDiscussionsSidebarTriggerSlot } from '../../plugin-slots/NotificationsDiscussionsSidebarTriggerSlot';
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
  const course = useModel('coursewareMeta', courseId);
  const {
    celebrations,
    isStaff,
    isNewDiscussionSidebarViewEnabled,
    originalUserIsStaff,
  } = useModel('courseHomeMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!originalUserIsStaff && pathname.startsWith('/preview')) {
    const courseUrl = pathname.replace('/preview', '');
    navigate(courseUrl, { replace: true });
  }

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);

  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const dispatch = useDispatch();

  const [firstSectionCelebrationOpen, setFirstSectionCelebrationOpen] = useState(false);
  // If streakLengthToCelebrate is populated, that modal takes precedence. Wait til the next load to display
  // the weekly goal celebration modal.
  const [weeklyGoalCelebrationOpen, setWeeklyGoalCelebrationOpen] = useState(
    celebrations && !celebrations.streakLengthToCelebrate && celebrations.weeklyGoal,
  );
  const shouldDisplayLearnerTools = windowWidth >= breakpoints.medium.minWidth;
  const daysPerWeek = course?.courseGoals?.selectedGoal?.daysPerWeek;

  useEffect(() => {
    const celebrateFirstSection = celebrations && celebrations.firstSection;
    setFirstSectionCelebrationOpen(shouldCelebrateOnSectionLoad(
      courseId,
      sequenceId,
      celebrateFirstSection,
      dispatch,
      celebrations,
    ));
  }, [sequenceId]);

  const SidebarProviderComponent = isNewDiscussionSidebarViewEnabled ? NewSidebarProvider : SidebarProvider;

  return (
    <SidebarProviderComponent courseId={courseId} unitId={unitId} sectionId={section ? section.id : null}>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
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
            enrollmentMode={course.enrollmentMode}
            isStaff={isStaff}
            courseId={courseId}
            unitId={unitId}
          />
        )}
        <div className="w-100 d-flex align-items-center">
          <CourseOutlineMobileSidebarTriggerSlot />
          <NotificationsDiscussionsSidebarTriggerSlot courseId={courseId} />
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
      <ContentTools course={course} />
    </SidebarProviderComponent>
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
