/* eslint-disable no-use-before-define */
import React, {
  useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  sendTrackEvent,
  sendTrackingLogEvent,
} from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { history } from '@edx/frontend-platform';
import SequenceExamWrapper from '@edx/frontend-lib-special-exams';
import { breakpoints, useWindowSize } from '@edx/paragon';

import PageLoading from '../../../generic/PageLoading';
import { useModel } from '../../../generic/model-store';
import { useSequenceBannerTextAlert, useSequenceEntranceExamAlert } from '../../../alerts/sequence-alerts/hooks';

import CourseLicense from '../course-license';
import Sidebar from '../sidebar/Sidebar';
import SidebarTriggers from '../sidebar/SidebarTriggers';
import messages from './messages';
import HiddenAfterDue from './hidden-after-due';
import { SequenceNavigation, UnitNavigation } from './sequence-navigation';
import SequenceContent from './SequenceContent';

/** [MM-P2P] Experiment */
import { isMobile } from '../../../experiments/mm-p2p/utils';
import { MMP2PFlyover, MMP2PFlyoverMobile } from '../../../experiments/mm-p2p';

function Sequence({
  unitId,
  sequenceId,
  courseId,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
  intl,
  mmp2p,
}) {
  const course = useModel('coursewareMeta', courseId);
  const {
    isStaff,
    originalUserIsStaff,
  } = useModel('courseHomeMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const unit = useModel('units', unitId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  const sequenceMightBeUnit = useSelector(state => state.courseware.sequenceMightBeUnit);
  const shouldDisplayNotificationTriggerInSequence = useWindowSize().width < breakpoints.small.minWidth;

  const handleNext = () => {
    const nextIndex = sequence.unitIds.indexOf(unitId) + 1;
    if (nextIndex < sequence.unitIds.length) {
      const newUnitId = sequence.unitIds[nextIndex];
      handleNavigate(newUnitId);
    } else {
      nextSequenceHandler();
    }
  };

  const handlePrevious = () => {
    const previousIndex = sequence.unitIds.indexOf(unitId) - 1;
    if (previousIndex >= 0) {
      const newUnitId = sequence.unitIds[previousIndex];
      handleNavigate(newUnitId);
    } else {
      previousSequenceHandler();
    }
  };

  const handleNavigate = (destinationUnitId) => {
    unitNavigationHandler(destinationUnitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = sequence.unitIds.length > 0 ? sequence.unitIds.indexOf(unitId) : 0;
    const payload = {
      current_tab: currentIndex + 1,
      id: unitId,
      tab_count: sequence.unitIds.length,
      widget_placement: widgetPlacement,
    };
    if (targetUnitId) {
      const targetIndex = sequence.unitIds.indexOf(targetUnitId);
      payload.target_tab = targetIndex + 1;
    }
    sendTrackEvent(eventName, payload);
    sendTrackingLogEvent(eventName, payload);
  };

  useSequenceBannerTextAlert(sequenceId);
  useSequenceEntranceExamAlert(courseId, sequenceId, intl);

  useEffect(() => {
    function receiveMessage(event) {
      const { type } = event.data;
      if (type === 'entranceExam.passed') {
        // I know this seems (is) intense. It is implemented this way since we need to refetch the underlying
        // course blocks that were originally hidden because the Entrance Exam was not passed.
        global.location.reload();
      }
    }
    global.addEventListener('message', receiveMessage);
  }, []);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };

  // We want hide the unit navigation if we're in the middle of navigating to another unit
  // but not if other things about the unit change, like the bookmark status.
  // The array property of this useEffect ensures that we only hide the unit navigation
  // while navigating to another unit.
  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [(unit || {}).id]);

  // If sequence might be a unit, we want to keep showing a spinner - the courseware container will redirect us when
  // it knows which sequence to actually go to.
  const loading = sequenceStatus === 'loading' || (sequenceStatus === 'failed' && sequenceMightBeUnit);
  if (loading) {
    if (!sequenceId) {
      return (<div> {intl.formatMessage(messages.noContent)} </div>);
    }
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages.loadingSequence)}
      />
    );
  }

  if (sequenceStatus === 'loaded' && sequence.isHiddenAfterDue) {
    // Shouldn't even be here - these sequences are normally stripped out of the navigation.
    // But we are here, so render a notice instead of the normal content.
    return <HiddenAfterDue courseId={courseId} />;
  }

  const gated = sequence && sequence.gatedContent !== undefined && sequence.gatedContent.gated;
  const goToCourseExitPage = () => {
    history.push(`/course/${courseId}/course-end`);
  };

  const defaultContent = (
    <div className="sequence-container d-inline-flex flex-row">
      <div className={classNames('sequence w-100', { 'position-relative': shouldDisplayNotificationTriggerInSequence })}>
        <SequenceNavigation
          sequenceId={sequenceId}
          unitId={unitId}
          className="mb-4"

          /** [MM-P2P] Experiment */
          mmp2p={mmp2p}

          nextSequenceHandler={() => {
            logEvent('edx.ui.lms.sequence.next_selected', 'top');
            handleNext();
          }}
          onNavigate={(destinationUnitId) => {
            logEvent('edx.ui.lms.sequence.tab_selected', 'top', destinationUnitId);
            handleNavigate(destinationUnitId);
          }}
          previousSequenceHandler={() => {
            logEvent('edx.ui.lms.sequence.previous_selected', 'top');
            handlePrevious();
          }}
          goToCourseExitPage={() => goToCourseExitPage()}
        />
        {shouldDisplayNotificationTriggerInSequence && <SidebarTriggers />}

        <div className="unit-container flex-grow-1">
          <SequenceContent
            courseId={courseId}
            gated={gated}
            sequenceId={sequenceId}
            unitId={unitId}
            unitLoadedHandler={handleUnitLoaded}
            /** [MM-P2P] Experiment */
            mmp2p={mmp2p}
          />
          {unitHasLoaded && (
          <UnitNavigation
            sequenceId={sequenceId}
            unitId={unitId}
            onClickPrevious={() => {
              logEvent('edx.ui.lms.sequence.previous_selected', 'bottom');
              handlePrevious();
            }}
            onClickNext={() => {
              logEvent('edx.ui.lms.sequence.next_selected', 'bottom');
              handleNext();
            }}
            goToCourseExitPage={() => goToCourseExitPage()}
          />
          )}
        </div>
      </div>
      <Sidebar />

      {/** [MM-P2P] Experiment */}
      {(mmp2p.state.isEnabled && mmp2p.flyover.isVisible) && (
        isMobile()
          ? <MMP2PFlyoverMobile options={mmp2p} />
          : <MMP2PFlyover options={mmp2p} />
      )}
    </div>
  );

  if (sequenceStatus === 'loaded') {
    return (
      <div>
        <SequenceExamWrapper
          sequence={sequence}
          courseId={courseId}
          isStaff={isStaff}
          originalUserIsStaff={originalUserIsStaff}
          canAccessProctoredExams={course.canAccessProctoredExams}
        >
          {defaultContent}
        </SequenceExamWrapper>
        <CourseLicense license={course.license || undefined} />
      </div>
    );
  }

  // sequence status 'failed' and any other unexpected sequence status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages.loadFailure)}
    </p>
  );
}

Sequence.propTypes = {
  unitId: PropTypes.string,
  sequenceId: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,

  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({
    flyover: PropTypes.shape({
      isVisible: PropTypes.bool.isRequired,
    }),
    meta: PropTypes.shape({
      showLock: PropTypes.bool,
    }),
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
    }),
  }),
};

Sequence.defaultProps = {
  sequenceId: null,
  unitId: null,
  /** [MM-P2P] Experiment */
  mmp2p: {
    flyover: { isVisible: false },
    meta: { showLock: false },
    state: { isEnabled: false },
  },
};

export default injectIntl(Sequence);
