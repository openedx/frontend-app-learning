/* eslint-disable no-use-before-define */
import React, {
  useEffect, useContext, Suspense, useState,
} from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Unit from './Unit';
import SequenceNavigation from './SequenceNavigation';
import PageLoading from '../../PageLoading';
import messages from './messages';
import UserMessagesContext from '../../user-messages/UserMessagesContext';
import UnitNavigation from './UnitNavigation';

const ContentLock = React.lazy(() => import('./content-lock'));

function Sequence({
  activeUnitId,
  bannerText,
  courseUsageKey,
  displayName,
  intl,
  isFirstUnit,
  isGated,
  isLastUnit,
  onNavigateUnit,
  onNext,
  onPrevious,
  prerequisite,
  showCompletion,
  unitIds,
}) {
  const handleNext = () => {
    const nextIndex = unitIds.indexOf(activeUnitId) + 1;
    if (nextIndex < unitIds.length) {
      const newUnitId = unitIds[nextIndex];
      handleNavigate(newUnitId);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    const previousIndex = unitIds.indexOf(activeUnitId) - 1;
    if (previousIndex >= 0) {
      const newUnitId = unitIds[previousIndex];
      handleNavigate(newUnitId);
    } else {
      onPrevious();
    }
  };

  const handleNavigate = (unitId) => {
    onNavigateUnit(unitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = unitIds.indexOf(activeUnitId);
    const payload = {
      current_tab: currentIndex + 1,
      id: activeUnitId,
      tab_count: unitIds.length,
      widget_placement: widgetPlacement,
    };
    if (targetUnitId) {
      const targetIndex = unitIds.indexOf(targetUnitId);
      payload.target_tab = targetIndex + 1;
    }
    sendTrackEvent(eventName, payload);
  };

  const { add, remove } = useContext(UserMessagesContext);
  useEffect(() => {
    let id = null;
    if (bannerText) {
      id = add({
        code: null,
        dismissible: false,
        text: bannerText,
        type: 'info',
        topic: 'sequence',
      });
    }
    return () => {
      if (id) {
        remove(id);
      }
    };
  }, [bannerText]);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };
  useEffect(() => {
    setUnitHasLoaded(false);
  }, [activeUnitId]);

  return (
    <div className="sequence">
      <SequenceNavigation
        activeUnitId={activeUnitId}
        className="mb-4"
        isFirstUnit={isFirstUnit}
        isLastUnit={isLastUnit}
        isLocked={isGated}
        onNext={() => {
          logEvent('edx.ui.lms.sequence.next_selected', 'top');
          handleNext();
        }}
        onNavigate={(unitId) => {
          logEvent('edx.ui.lms.sequence.tab_selected', 'top', unitId);
          handleNavigate(unitId);
        }}
        onPrevious={() => {
          logEvent('edx.ui.lms.sequence.previous_selected', 'top');
          handlePrevious();
        }}
        showCompletion={showCompletion}
        unitIds={unitIds}
      />
      <div className="unit-container flex-grow-1">
        {isGated && (
          <Suspense
            fallback={(
              <PageLoading
                srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
              />
            )}
          >
            <ContentLock
              courseUsageKey={courseUsageKey}
              sectionName={displayName}
              prereqSectionName={prerequisite.name}
              prereqId={prerequisite.id}
            />
          </Suspense>
        )}
        {!isGated && (
          <Unit
            key={activeUnitId}
            id={activeUnitId}
            onLoaded={handleUnitLoaded}
          />
        )}
        {unitHasLoaded && (
          <UnitNavigation
            isFirstUnit={isFirstUnit}
            onClickPrevious={() => {
              logEvent('edx.ui.lms.sequence.previous_selected', 'bottom');
              handlePrevious();
            }}
            onClickNext={() => {
              logEvent('edx.ui.lms.sequence.next_selected', 'bottom');
              handleNext();
            }}
            isLastUnit={isLastUnit}
          />
        )}
      </div>
    </div>
  );
}

Sequence.propTypes = {
  activeUnitId: PropTypes.string.isRequired,
  bannerText: PropTypes.string,
  courseUsageKey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isFirstUnit: PropTypes.bool.isRequired,
  isGated: PropTypes.bool.isRequired,
  isLastUnit: PropTypes.bool.isRequired,
  onNavigateUnit: PropTypes.func,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  prerequisite: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Sequence.defaultProps = {
  onNavigateUnit: null,
  bannerText: undefined,
};

export default injectIntl(Sequence);
