/* eslint-disable no-use-before-define */
import React, {
  useEffect, useContext, Suspense, useState,
} from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Unit from './Unit';
import { SequenceNavigation, UnitNavigation } from '../sequence-navigation';
import PageLoading from '../../PageLoading';
import messages from './messages';
import UserMessagesContext from '../../user-messages/UserMessagesContext';
import { unitShape, sequenceShape, statusShape } from '../course/shapes';

const ContentLock = React.lazy(() => import('./content-lock'));

function Sequence({
  unit,
  sequence,
  status,
  courseUsageKey,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
  intl,
}) {
  const handleNext = () => {
    const nextIndex = sequence.unitIds.indexOf(unit.id) + 1;
    if (nextIndex < sequence.unitIds.length) {
      const newUnitId = sequence.unitIds[nextIndex];
      handleNavigate(newUnitId);
    } else {
      nextSequenceHandler();
    }
  };

  const handlePrevious = () => {
    const previousIndex = sequence.unitIds.indexOf(unit.id) - 1;
    if (previousIndex >= 0) {
      const newUnitId = sequence.unitIds[previousIndex];
      handleNavigate(newUnitId);
    } else {
      previousSequenceHandler();
    }
  };

  const handleNavigate = (unitId) => {
    unitNavigationHandler(unitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = sequence.unitIds.indexOf(unit.id);
    const payload = {
      current_tab: currentIndex + 1,
      id: unit.id,
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
    if (status.sequence === 'loaded') {
      if (sequence.bannerText) {
        id = add({
          code: null,
          dismissible: false,
          text: sequence.bannerText,
          type: 'info',
          topic: 'sequence',
        });
      }
    }
    return () => {
      if (id) {
        remove(id);
      }
    };
  }, [status.sequence, sequence]);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };
  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [unit]);

  if (status.sequence === 'loading') {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  const gated = sequence.gatedContent !== undefined && sequence.gatedContent.gated;

  if (status.sequence === 'loaded' && unit) {
    return (
      <div className="sequence">
        <SequenceNavigation
          sequenceId={sequence.id}
          unitId={unit.id}
          className="mb-4"
          nextSequenceHandler={() => {
            logEvent('edx.ui.lms.sequence.next_selected', 'top');
            handleNext();
          }}
          onNavigate={(unitId) => {
            logEvent('edx.ui.lms.sequence.tab_selected', 'top', unitId);
            handleNavigate(unitId);
          }}
          previousSequenceHandler={() => {
            logEvent('edx.ui.lms.sequence.previous_selected', 'top');
            handlePrevious();
          }}
        />
        <div className="unit-container flex-grow-1">
          {gated && (
            <Suspense
              fallback={(
                <PageLoading
                  srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
                />
              )}
            >
              <ContentLock
                courseUsageKey={courseUsageKey}
                sequenceTitle={sequence.title}
                prereqSectionName={sequence.gatedContent.gatedSectionName}
                prereqId={sequence.gatedContent.prereqId}
              />
            </Suspense>
          )}
          {!gated && (
            <Unit
              key={unit.id}
              id={unit.id}
              onLoaded={handleUnitLoaded}
            />
          )}
          {unitHasLoaded && (
            <UnitNavigation
              sequenceId={sequence.id}
              unitId={unit.id}
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
  unit: unitShape,
  sequence: sequenceShape,
  status: statusShape.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

Sequence.defaultProps = {
  sequence: undefined,
  unit: undefined,
};

export default injectIntl(Sequence);
