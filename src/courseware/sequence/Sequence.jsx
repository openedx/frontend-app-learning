/* eslint-disable no-use-before-define */
import React, { useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Unit from './Unit';
import SequenceNavigation from './SequenceNavigation';
import PageLoading from '../PageLoading';
import { getBlockCompletion, saveSequencePosition } from './api';
import messages from './messages';
import AlertList from '../../user-messages/AlertList';

const ContentLock = React.lazy(() => import('./content-lock'));

function Sequence({
  courseUsageKey,
  id,
  unitIds,
  units: initialUnits,
  displayName,
  showCompletion,
  onNext,
  onPrevious,
  onNavigateUnit,
  isGated,
  prerequisite,
  savePosition,
  activeUnitId: initialActiveUnitId,
  intl,
}) {
  const [units, setUnits] = useState(initialUnits);
  const [activeUnitId, setActiveUnitId] = useState(initialActiveUnitId);

  const activeUnitIndex = unitIds.indexOf(activeUnitId);
  const activeUnit = units[activeUnitId];
  const unitsArr = unitIds.map(unitId => ({
    ...units[unitId],
    id: unitId,
    isActive: unitId === activeUnitId,
  }));

  // TODO: Use callback
  const updateUnitCompletion = (unitId) => {
    // If the unit is already complete, don't check.
    if (units[unitId].complete) {
      return;
    }

    getBlockCompletion(courseUsageKey, id, unitId).then((isComplete) => {
      if (isComplete) {
        setUnits({
          ...units,
          [unitId]: { ...units[unitId], complete: isComplete },
        });
      }
    });
  };

  const handleNext = () => {
    if (activeUnitIndex < unitIds.length - 1) {
      handleNavigate(activeUnitIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (activeUnitIndex > 0) {
      handleNavigate(activeUnitIndex - 1);
    } else {
      onPrevious();
    }
  };

  const handleNavigate = (unitIndex) => {
    const newUnitId = unitIds[unitIndex];
    if (showCompletion) {
      updateUnitCompletion(activeUnitId);
    }
    setActiveUnitId(newUnitId);
    if (onNavigateUnit !== null) {
      onNavigateUnit(newUnitId, units[newUnitId]);
    }
  };

  useEffect(() => {
    if (savePosition) {
      saveSequencePosition(courseUsageKey, id, activeUnitIndex);
    }
  }, [activeUnitId]);

  return (
    <div className="flex-grow-1">
      <div className="container-fluid">
        <AlertList topic="sequence" className="mt-3" />
        <SequenceNavigation
          className="mb-3"
          onNext={handleNext}
          onNavigate={handleNavigate}
          onPrevious={handlePrevious}
          units={unitsArr}
          isLocked={isGated}
          showCompletion={showCompletion}
        />
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
      </div>
      {!isGated && (
        <Unit key={activeUnitId} {...activeUnit} />
      )}
    </div>
  );
}

Sequence.propTypes = {
  activeUnitId: PropTypes.string.isRequired,
  bannerText: PropTypes.string,
  courseUsageKey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isGated: PropTypes.bool.isRequired,
  isTimeLimited: PropTypes.bool.isRequired,
  onNavigateUnit: PropTypes.func,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  savePosition: PropTypes.bool.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  prerequisite: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  units: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    complete: PropTypes.bool,
    pageTitle: PropTypes.string.isRequired,
  })).isRequired,
};

Sequence.defaultProps = {
  bannerText: null,
  onNavigateUnit: null,
};

export default injectIntl(Sequence);
