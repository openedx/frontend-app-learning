/* eslint-disable no-use-before-define */
import React, {
  useEffect, useContext, useState,
} from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import PageLoading from '../../../generic/PageLoading';
import { UserMessagesContext, ALERT_TYPES } from '../../../generic/user-messages';
import { useModel } from '../../../generic/model-store';

import CourseLicense from '../course-license';
import messages from './messages';
import { SequenceNavigation, UnitNavigation } from './sequence-navigation';
import SequenceContent from './SequenceContent';
import { SEQUENCE_LOADED, SEQUENCE_LOADING } from '../../data';

function Sequence({
  unitId,
  sequenceId,
  courseId,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
  intl,
}) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const unit = useModel('units', unitId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
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
  };

  const { add, remove } = useContext(UserMessagesContext);
  useEffect(() => {
    let id = null;
    if (sequenceStatus === SEQUENCE_LOADED) {
      if (sequence.bannerText) {
        id = add({
          code: null,
          dismissible: false,
          text: sequence.bannerText,
          type: ALERT_TYPES.INFO,
          topic: 'sequence',
        });
      }
    }
    return () => {
      if (id) {
        remove(id);
      }
    };
  }, [sequenceStatus, sequence]);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };
  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [unit]);

  if (sequenceStatus === SEQUENCE_LOADING) {
    if (!sequenceId) {
      return (<div> {intl.formatMessage(messages['learn.sequence.no.content'])} </div>);
    }
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  const gated = sequence && sequence.gatedContent !== undefined && sequence.gatedContent.gated;

  if (sequenceStatus === SEQUENCE_LOADED) {
    return (
      <div className="sequence-container">
        <div className="sequence">
          <SequenceNavigation
            sequenceId={sequenceId}
            unitId={unitId}
            className="mb-4"
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
          />
          <div className="unit-container flex-grow-1">
            <SequenceContent
              courseId={courseId}
              gated={gated}
              sequenceId={sequenceId}
              unitId={unitId}
              unitLoadedHandler={handleUnitLoaded}
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
              />
            )}
          </div>
        </div>
        <div className="sequence-footer px-4 py-1">
          <CourseLicense license={course.license || undefined} />
        </div>
      </div>
    );
  }

  // sequence status 'failed' and any other unexpected sequence status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages['learn.course.load.failure'])}
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
};

Sequence.defaultProps = {
  sequenceId: null,
  unitId: null,
};

export default injectIntl(Sequence);
