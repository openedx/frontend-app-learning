import React, { useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import Unit from './Unit';
import SequenceNavigation from './SequenceNavigation';
import PageLoading from '../PageLoading';
import { getBlockCompletion, saveSequencePosition } from './api';
const ContentLock = React.lazy(() => import('./content-lock'));
import messages from './messages';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

function Sequence({
  courseId,
  id,
  unitIds,
  units: initialUnits,
  displayName,
  showCompletion,
  isTimeLimited,
  bannerText,
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
  const unitsArr = unitIds.map((unitId) => ({
    ...units[unitId],
    id: unitId,
    isActive: unitId === activeUnitId,
  }));

  const updateUnitCompletion = (unitId) => {
    // If the unit is already complete, don't check.
    if (units[unitId].complete) {
      return;
    }

    getBlockCompletion(courseId, id, unitId).then((isComplete) => {
      if (isComplete) {
        setUnits({
          ...units,
          [unitId]: { ...units[unitId], complete: isComplete },
        });
      }
    })
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
    onNavigateUnit(newUnitId, units[newUnitId]);
  };

  useEffect(() => {
    if (savePosition) {
      saveSequencePosition(courseId, id, activeUnitIndex);
    }
  }, [activeUnitId]);

  return (
    <div className="d-flex flex-column flex-grow-1">
      <SequenceNavigation
        onNext={handleNext}
        onNavigate={handleNavigate}
        onPrevious={handlePrevious}
        units={unitsArr}
        isLocked={isGated}
        showCompletion={showCompletion}
      />
      {isGated? (
        <Suspense fallback={<PageLoading
          srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
        />}>
          <ContentLock
            courseId={courseId}
            sectionName={displayName}
            prereqSectionName={prerequisite.name}
            prereqId={prerequisite.id}
          />
        </Suspense>
      ): (
        <Unit key={activeUnitId} {...activeUnit} />
      )}
    </div>
  );
}

Sequence.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  units: PropTypes.objectOf(PropTypes.shape({
  })),
  displayName: PropTypes.string.isRequired,
  activeUnitId: PropTypes.string.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  isTimeLimited: PropTypes.bool.isRequired,
  bannerText: PropTypes.string,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNavigateUnit: PropTypes.func.isRequired,
  isGated: PropTypes.bool.isRequired,
  prerequisite: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }),
  savePosition: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Sequence);
