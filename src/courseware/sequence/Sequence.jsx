/* eslint-disable no-use-before-define */
import React, { useState, useEffect, Suspense } from 'react';
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
  activeUnitId: initialActiveUnitId,
  activeUnit,
  intl,
}) {
  const [activeUnitId, setActiveUnitId] = useState(initialActiveUnitId);

  const activeUnitIndex = unitIds.indexOf(activeUnitId);

  const handleNext = () => {
    if (activeUnitIndex < unitIds.length - 1) {
      const newUnitId = unitIds[activeUnitIndex + 1];
      handleNavigate(newUnitId);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (activeUnitIndex > 0) {
      const newUnitId = unitIds[activeUnitIndex - 1];
      handleNavigate(newUnitId);
    } else {
      onPrevious();
    }
  };

  const handleNavigate = (newUnitId) => {
    setActiveUnitId(newUnitId);
    if (onNavigateUnit !== null) {
      onNavigateUnit(newUnitId);
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
          {...activeUnit}
          unitId={activeUnitId}
        />
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
  activeUnit: PropTypes.shape({
    blockId: PropTypes.string,
    bookmarked: PropTypes.bool,
    complete: PropTypes.bool,
    content: PropTypes.string,
    contentType: PropTypes.string,
    displayName: PropTypes.string,
    graded: PropTypes.bool,
    href: PropTypes.string,
    id: PropTypes.string,
    lmsWebUrl: PropTypes.string,
    pageTitle: PropTypes.string,
    parentId: PropTypes.string,
    studentViewUrl: PropTypes.string,
  }),
};

Sequence.defaultProps = {
  bannerText: null,
  onNavigateUnit: null,
  activeUnit: null,
};

export default injectIntl(Sequence);
