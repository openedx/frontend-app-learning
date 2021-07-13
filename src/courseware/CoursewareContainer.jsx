import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { history } from '@edx/frontend-platform';
import { getLocale } from '@edx/frontend-platform/i18n';
import { Redirect } from 'react-router';
import { createSelector } from '@reduxjs/toolkit';
import { defaultMemoize as memoize } from 'reselect';

import {
  checkBlockCompletion,
  fetchCourse,
  fetchSequence,
  getResumeBlock,
  saveSequencePosition,
} from './data';
import { TabPage } from '../tab-page';

import Course from './course';
import { handleNextSectionCelebration } from './course/celebration';

const checkResumeRedirect = memoize((courseStatus, courseId, sequenceId, firstSequenceId) => {
  if (courseStatus === 'loaded' && !sequenceId) {
    // Note that getResumeBlock is just an API call, not a redux thunk.
    getResumeBlock(courseId).then((data) => {
      // This is a replace because we don't want this change saved in the browser's history.
      if (data.sectionId && data.unitId) {
        history.replace(`/c/${courseId}/${data.sectionId}/${data.unitId}`);
      } else if (firstSequenceId) {
        history.replace(`/c/${courseId}/${firstSequenceId}`);
      }
    });
  }
});

const checkSectionUnitToUnitRedirect = memoize((courseStatus, courseId, sequenceStatus, section, unitId) => {
  if (courseStatus === 'loaded' && sequenceStatus === 'failed' && section && unitId) {
    history.replace(`/c/${courseId}/${unitId}`);
  }
});

const checkSectionToSequenceRedirect = memoize((courseStatus, courseId, sequenceStatus, section, unitId) => {
  if (courseStatus === 'loaded' && sequenceStatus === 'failed' && section && !unitId) {
    // If the section is non-empty, redirect to its first sequence.
    if (section.sequenceIds && section.sequenceIds[0]) {
      history.replace(`/c/${courseId}/${section.sequenceIds[0]}`);
    // Otherwise, just go to the course root, letting the resume redirect take care of things.
    } else {
      history.replace(`/c/${courseId}`);
    }
  }
});

const checkUnitToSequenceUnitRedirect = memoize((courseStatus, courseId, sequenceStatus, unit) => {
  if (courseStatus === 'loaded' && sequenceStatus === 'failed' && unit) {
    // If the sequence failed to load as a sequence, but it *did* load as a unit, then
    // insert the unit's parent sequenceId into the URL.
    history.replace(`/c/${courseId}/${unit.sequenceId}/${unit.id}`);
  }
});

const checkSpecialExamRedirect = memoize((sequenceStatus, sequence) => {
  if (sequenceStatus === 'loaded') {
    if (sequence.isTimeLimited && sequence.legacyWebUrl !== undefined) {
      global.location.assign(sequence.legacyWebUrl);
    }
  }
});

const checkSequenceToSequenceUnitRedirect = memoize((courseId, sequenceStatus, sequence, unitId) => {
  if (sequenceStatus === 'loaded' && sequence.id && !unitId) {
    if (sequence.unitIds !== undefined && sequence.unitIds.length > 0) {
      const nextUnitId = sequence.unitIds[sequence.activeUnitIndex];
      // This is a replace because we don't want this change saved in the browser's history.
      history.replace(`/c/${courseId}/${sequence.id}/${nextUnitId}`);
    }
  }
});

class CoursewareContainer extends Component {
  checkSaveSequencePosition = memoize((unitId) => {
    const {
      courseId,
      sequenceId,
      sequenceStatus,
      sequence,
    } = this.props;
    if (sequenceStatus === 'loaded' && sequence.saveUnitPosition && unitId) {
      const activeUnitIndex = sequence.unitIds.indexOf(unitId);
      this.props.saveSequencePosition(courseId, sequenceId, activeUnitIndex);
    }
  });

  checkFetchCourse = memoize((courseId) => {
    this.props.fetchCourse(courseId);
  });

  checkFetchSequence = memoize((sequenceId) => {
    if (sequenceId) {
      this.props.fetchSequence(sequenceId);
    }
  });

  componentDidMount() {
    const {
      match: {
        params: {
          courseId: routeCourseId,
          // sequenceId: routeSequenceId,
          sequenceId: routeSequenceHash,
        },
      },
    } = this.props;
    // const routeSequenceId = decodeURIComponent(routeSequenceHash.replace(/\+/g, ' '));
    // console.log(routeSequenceId);
    // Load data whenever the course or sequence ID changes.
    this.checkFetchCourse(routeCourseId);
    // this.checkFetchSequence(routeSequenceId);
    this.checkFetchSequence(routeSequenceHash);
  }

  componentDidUpdate() {
    const {
      courseId,
      sequenceId,
      courseStatus,
      sequenceStatus,
      specialExamsEnabledWaffleFlag,
      proctoredExamsEnabledWaffleFlag,
      sequence,
      firstSequenceId,
      unitViaSequenceId,
      sectionViaSequenceId,
      match: {
        params: {
          courseId: routeCourseId,
          sequenceId: routeSequenceId,
          unitId: routeUnitId,
        },
      },
    } = this.props;
    // Load data whenever the course or sequence ID changes.
    this.checkFetchCourse(routeCourseId);
    this.checkFetchSequence(routeSequenceId);

    // All courseware URLs should normalize to the format /course/:courseId/:sequenceId/:unitId
    // via the series of redirection rules below.
    // See docs/decisions/0008-liberal-courseware-path-handling.md for more context.
    // (It would be ideal to move this logic into the thunks layer and perform
    //  all URL-changing checks at once. This should be done once the MFE is moved
    //  to the new Outlines API. See TNL-8182.)

    // Check resume redirect:
    //   /course/:courseId -> /course/:courseId/:sequenceId/:unitId
    // based on sequence/unit where user was last active.
    checkResumeRedirect(courseStatus, courseId, sequenceId, firstSequenceId);

    // Check section-unit to unit redirect:
    //    /course/:courseId/:sectionId/:unitId -> /course/:courseId/:unitId
    // by simply ignoring the :sectionId.
    // (It may be desirable at some point to be smarter here; for example, we could replace
    //  :sectionId with the parent sequence of :unitId and/or check whether the :unitId
    //  is actually within :sectionId. However, the way our Redux store is currently factored,
    //  the unit's metadata is not available to us if the section isn't loadable.)
    // Before performing this redirect, we *do* still check that a section is loadable;
    // otherwise, we could get stuck in a redirect loop, since a sequence that failed to load
    // would endlessly redirect to itself through `checkSectionUnitToUnitRedirect`
    // and `checkUnitToSequenceUnitRedirect`.
    checkSectionUnitToUnitRedirect(courseStatus, courseId, sequenceStatus, sectionViaSequenceId, routeUnitId);

    // Check section to sequence redirect:
    //    /course/:courseId/:sectionId         -> /course/:courseId/:sequenceId
    // by redirecting to the first sequence within the section.
    checkSectionToSequenceRedirect(courseStatus, courseId, sequenceStatus, sectionViaSequenceId, routeUnitId);

    // Check unit to sequence-unit redirect:
    //    /course/:courseId/:unitId -> /course/:courseId/:sequenceId/:unitId
    // by filling in the ID of the parent sequence of :unitId.
    checkUnitToSequenceUnitRedirect(courseStatus, courseId, sequenceStatus, unitViaSequenceId);

    // Check special exam redirect:
    //    /course/:courseId/:sequenceId(/:unitId) -> :legacyWebUrl
    // because special exams are currently still served in the legacy LMS frontend.
    const shouldRedirectProctoredExams = specialExamsEnabledWaffleFlag && sequence.isProctored
      && !proctoredExamsEnabledWaffleFlag;
    if (!specialExamsEnabledWaffleFlag || shouldRedirectProctoredExams) {
      checkSpecialExamRedirect(sequenceStatus, sequence);
    }

    // Check to sequence to sequence-unit redirect:
    //    /course/:courseId/:sequenceId -> /course/:courseId/:sequenceId/:unitId
    // by filling in the ID the most-recently-active unit in the sequence, OR
    // the ID of the first unit the sequence if none is active.
    checkSequenceToSequenceUnitRedirect(courseId, sequenceStatus, sequence, routeUnitId);

    // Check if we should save our sequence position.  Only do this when the route unit ID changes.
    this.checkSaveSequencePosition(routeUnitId);
  }

  handleUnitNavigationClick = (nextUnitId) => {
    const {
      courseId, sequenceId,
      match: {
        params: {
          unitId: routeUnitId,
        },
      },
    } = this.props;

    this.props.checkBlockCompletion(courseId, sequenceId, routeUnitId);
    history.push(`/c/${courseId}/${sequenceId}/${nextUnitId}`);
  }

  handleNextSequenceClick = () => {
    const {
      course,
      courseId,
      nextSequence,
      sequence,
      sequenceId,
    } = this.props;

    if (nextSequence !== null) {
      let nextUnitId = null;
      if (nextSequence.unitIds.length > 0) {
        [nextUnitId] = nextSequence.unitIds;
        history.push(`/c/${courseId}/${nextSequence.id}/${nextUnitId}`);
      } else {
        // Some sequences have no units.  This will show a blank page with prev/next buttons.
        history.push(`/c/${courseId}/${nextSequence.id}`);
      }

      const celebrateFirstSection = course && course.celebrations && course.celebrations.firstSection;
      if (celebrateFirstSection && sequence.sectionId !== nextSequence.sectionId) {
        handleNextSectionCelebration(sequenceId, nextSequence.id, nextUnitId);
      }
    }
  }

  handlePreviousSequenceClick = () => {
    const { previousSequence, courseId } = this.props;
    if (previousSequence !== null) {
      if (previousSequence.unitIds.length > 0) {
        const previousUnitId = previousSequence.unitIds[previousSequence.unitIds.length - 1];
        history.push(`/c/${courseId}/${previousSequence.id}/${previousUnitId}`);
      } else {
        // Some sequences have no units.  This will show a blank page with prev/next buttons.
        history.push(`/c/${courseId}/${previousSequence.id}`);
      }
    }
  }

  renderDenied() {
    const {
      course,
      courseId,
      match: {
        params: {
          unitId: routeUnitId,
        },
      },
    } = this.props;
    let url = `/redirect/course-home/${courseId}`;
    switch (course.canLoadCourseware.errorCode) {
      case 'audit_expired':
        url = `/redirect/dashboard?access_response_error=${course.canLoadCourseware.additionalContextUserMessage}`;
        break;
      case 'course_not_started':
        // eslint-disable-next-line no-case-declarations
        const startDate = (new Intl.DateTimeFormat(getLocale())).format(new Date(course.start));
        url = `/redirect/dashboard?notlive=${startDate}`;
        break;
      case 'survey_required': // TODO: Redirect to the course survey
      case 'unfulfilled_milestones':
        url = '/redirect/dashboard';
        break;
      case 'microfrontend_disabled':
        url = `/redirect/courseware/${courseId}/unit/${routeUnitId}`;
        break;
      case 'authentication_required':
      case 'enrollment_required':
      default:
    }
    return (
      <Redirect to={url} />
    );
  }

  render() {
    const {
      courseStatus,
      courseId,
      sequenceId,
      match: {
        params: {
          unitId: routeUnitId,
        },
      },
    } = this.props;

    if (courseStatus === 'denied') {
      return this.renderDenied();
    }

    return (
      <TabPage
        activeTabSlug="courseware"
        courseId={courseId}
        unitId={routeUnitId}
        courseStatus={courseStatus}
        metadataModel="coursewareMeta"
      >
        <Course
          courseId={courseId}
          sequenceId={sequenceId}
          unitId={routeUnitId}
          nextSequenceHandler={this.handleNextSequenceClick}
          previousSequenceHandler={this.handlePreviousSequenceClick}
          unitNavigationHandler={this.handleUnitNavigationClick}
        />
      </TabPage>
    );
  }
}

const unitShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
});

const sequenceShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  sectionId: PropTypes.string.isRequired,
  isTimeLimited: PropTypes.bool,
  isProctored: PropTypes.bool,
  legacyWebUrl: PropTypes.string,
});

const sectionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  sequenceIds: PropTypes.arrayOf(PropTypes.string).isRequired,
});

const courseShape = PropTypes.shape({
  canLoadCourseware: PropTypes.shape({
    errorCode: PropTypes.string,
    additionalContextUserMessage: PropTypes.string,
  }).isRequired,
});

CoursewareContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      sequenceId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  firstSequenceId: PropTypes.string,
  courseStatus: PropTypes.oneOf(['loaded', 'loading', 'failed', 'denied']).isRequired,
  sequenceStatus: PropTypes.oneOf(['loaded', 'loading', 'failed']).isRequired,
  nextSequence: sequenceShape,
  previousSequence: sequenceShape,
  unitViaSequenceId: unitShape,
  sectionViaSequenceId: sectionShape,
  course: courseShape,
  sequence: sequenceShape,
  saveSequencePosition: PropTypes.func.isRequired,
  checkBlockCompletion: PropTypes.func.isRequired,
  fetchCourse: PropTypes.func.isRequired,
  fetchSequence: PropTypes.func.isRequired,
  specialExamsEnabledWaffleFlag: PropTypes.bool.isRequired,
  proctoredExamsEnabledWaffleFlag: PropTypes.bool.isRequired,
};

CoursewareContainer.defaultProps = {
  courseId: null,
  sequenceId: null,
  firstSequenceId: null,
  nextSequence: null,
  previousSequence: null,
  unitViaSequenceId: null,
  sectionViaSequenceId: null,
  course: null,
  sequence: null,
};

const currentCourseSelector = createSelector(
  (state) => state.models.coursewareMeta || {},
  (state) => state.courseware.courseId,
  (coursesById, courseId) => (coursesById[courseId] ? coursesById[courseId] : null),
);

const currentSequenceSelector = createSelector(
  (state) => state.models.sequences || {},
  (state) => state.courseware.sequenceId,
  (sequencesById, sequenceId) => (sequencesById[sequenceId] ? sequencesById[sequenceId] : null),
);

const sequenceIdsSelector = createSelector(
  (state) => state.courseware.courseStatus,
  currentCourseSelector,
  (state) => state.models.sections,
  (courseStatus, course, sectionsById) => {
    if (courseStatus !== 'loaded') {
      return [];
    }
    const { sectionIds = [] } = course;
    return sectionIds.flatMap(sectionId => sectionsById[sectionId].sequenceIds);
  },
);

const previousSequenceSelector = createSelector(
  sequenceIdsSelector,
  (state) => state.models.sequences || {},
  (state) => state.courseware.sequenceId,
  (sequenceIds, sequencesById, sequenceId) => {
    if (!sequenceId || sequenceIds.length === 0) {
      return null;
    }
    const sequenceIndex = sequenceIds.indexOf(sequenceId);
    const previousSequenceId = sequenceIndex > 0 ? sequenceIds[sequenceIndex - 1] : null;
    return previousSequenceId !== null ? sequencesById[previousSequenceId] : null;
  },
);

const nextSequenceSelector = createSelector(
  sequenceIdsSelector,
  (state) => state.models.sequences || {},
  (state) => state.courseware.sequenceId,
  (sequenceIds, sequencesById, sequenceId) => {
    if (!sequenceId || sequenceIds.length === 0) {
      return null;
    }
    const sequenceIndex = sequenceIds.indexOf(sequenceId);
    const nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
    return nextSequenceId !== null ? sequencesById[nextSequenceId] : null;
  },
);

const firstSequenceIdSelector = createSelector(
  (state) => state.courseware.courseStatus,
  currentCourseSelector,
  (state) => state.models.sections || {},
  (courseStatus, course, sectionsById) => {
    if (courseStatus !== 'loaded') {
      return null;
    }
    const { sectionIds = [] } = course;

    if (sectionIds.length === 0) {
      return null;
    }

    return sectionsById[sectionIds[0]].sequenceIds[0];
  },
);

const sectionViaSequenceIdSelector = createSelector(
  (state) => state.models.sections || {},
  (state) => state.courseware.sequenceId,
  (sectionsById, sequenceId) => (sectionsById[sequenceId] ? sectionsById[sequenceId] : null),
);

const unitViaSequenceIdSelector = createSelector(
  (state) => state.models.units || {},
  (state) => state.courseware.sequenceId,
  (unitsById, sequenceId) => (unitsById[sequenceId] ? unitsById[sequenceId] : null),
);

const mapStateToProps = (state) => {
  const {
    courseId,
    sequenceId,
    courseStatus,
    sequenceStatus,
    specialExamsEnabledWaffleFlag,
    proctoredExamsEnabledWaffleFlag,
  } = state.courseware;

  return {
    courseId,
    sequenceId,
    courseStatus,
    sequenceStatus,
    specialExamsEnabledWaffleFlag,
    proctoredExamsEnabledWaffleFlag,
    course: currentCourseSelector(state),
    sequence: currentSequenceSelector(state),
    previousSequence: previousSequenceSelector(state),
    nextSequence: nextSequenceSelector(state),
    firstSequenceId: firstSequenceIdSelector(state),
    sectionViaSequenceId: sectionViaSequenceIdSelector(state),
    unitViaSequenceId: unitViaSequenceIdSelector(state),
  };
};

export default connect(mapStateToProps, {
  checkBlockCompletion,
  saveSequencePosition,
  fetchCourse,
  fetchSequence,
})(CoursewareContainer);
