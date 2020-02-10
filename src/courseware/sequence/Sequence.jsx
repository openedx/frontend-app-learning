/* eslint-disable no-use-before-define */
import React, { useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Unit from './Unit';
import SequenceNavigation from './SequenceNavigation';
import PageLoading from '../PageLoading';
import { saveSequencePosition } from './api';
import messages from './messages';
import AlertList from '../../user-messages/AlertList';

const ContentLock = React.lazy(() => import('./content-lock'));

function Sequence({
  courseUsageKey,
  id,
  unitIds,
  displayName,
  showCompletion,
  onNext,
  onPrevious,
  onNavigateUnit,
  isGated,
  prerequisite,
  savePosition,
  activeUnitId,
  intl,
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

  useEffect(() => {
    if (savePosition) {
      const activeUnitIndex = unitIds.indexOf(activeUnitId);
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
          unitIds={unitIds}
          activeUnitId={activeUnitId}
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
        <Unit
          key={activeUnitId}
          id={activeUnitId}
        />
      )}
    </div>
  );
}

Sequence.propTypes = {
  activeUnitId: PropTypes.string.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isGated: PropTypes.bool.isRequired,
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
};

Sequence.defaultProps = {
  onNavigateUnit: null,
};

export default injectIntl(Sequence);
