import React, { Suspense, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import PageLoading from '../../../generic/PageLoading';
import { useSequenceMetadata, useUnit } from '../../data/apiHooks';

import messages from './messages';
import Unit from './Unit';

const ContentLock = React.lazy(() => import('./content-lock'));

const SequenceContent = ({
  gated,
  courseId,
  sequenceId,
  unitId,
  unitLoadedHandler,
  isOriginalUserStaff,
  renderUnitNavigation,
}) => {
  const intl = useIntl();
  const sequence = useSequenceMetadata(sequenceId, { enabled: false }).data?.sequence;
  const unit = useUnit(sequenceId, unitId).data;

  // Remembers the unit we last moved focus for, so we can tell a real next/previous
  // navigation apart from the initial load and from re-renders of the same unit.
  const focusedUnitId = useRef(unitId);

  // Go back to the top of the page whenever the unit or sequence changes.
  useEffect(() => {
    global.scrollTo(0, 0);
  }, [sequenceId, unitId]);

  // After the user navigates to a different unit, move focus to its heading so
  // keyboard and screen-reader users get immediate context instead of being left on
  // the next/previous button. The initial load is skipped so the normal page start
  // (e.g. the "Skip to main content" link) is preserved.
  useEffect(() => {
    if (unitId === focusedUnitId.current) {
      return;
    }
    const unitHeading = global.document.getElementById('courseware-unit-title');
    // Wait for the heading to render if the new unit is still loading.
    if (!unitHeading && unitId && !unit && !gated) {
      return;
    }
    focusedUnitId.current = unitId;
    if (unitHeading) {
      unitHeading.focus();
      return;
    }
    // Gated or empty content has no heading; fall back to the MFE root, then body.
    const mainContainer = global.document.querySelector('div.app-container');
    if (mainContainer) {
      if (!mainContainer.hasAttribute('tabindex')) {
        mainContainer.setAttribute('tabindex', '-1');
      }
      mainContainer.focus();
    } else {
      global.document.body.focus();
    }
  }, [unitId, unit, gated]);

  if (gated) {
    return (
      <Suspense
        fallback={(
          <PageLoading
            srMessage={intl.formatMessage(messages.loadingLockedContent)}
          />
        )}
      >
        <ContentLock
          courseId={courseId}
          sequenceTitle={sequence.title}
          prereqSectionName={sequence.gatedContent.prereqSectionName}
          prereqId={sequence.gatedContent.prereqId}
        />
      </Suspense>
    );
  }

  if (!unitId || !unit) {
    return (
      <div>
        {intl.formatMessage(messages.noContent)}
      </div>
    );
  }

  return (
    <Unit
      courseId={courseId}
      format={sequence.format}
      key={unitId}
      id={unitId}
      sequenceId={sequenceId}
      onLoaded={unitLoadedHandler}
      isOriginalUserStaff={isOriginalUserStaff}
      renderUnitNavigation={renderUnitNavigation}
    />
  );
};

SequenceContent.propTypes = {
  gated: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  unitLoadedHandler: PropTypes.func.isRequired,
  isOriginalUserStaff: PropTypes.bool.isRequired,
  renderUnitNavigation: PropTypes.func.isRequired,
};

SequenceContent.defaultProps = {
  unitId: null,
};

export default SequenceContent;
