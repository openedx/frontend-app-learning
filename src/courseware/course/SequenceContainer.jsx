/* eslint-disable no-plusplus */
import React, { useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history } from '@edx/frontend-platform';

import messages from '../messages';
import PageLoading from '../../PageLoading';
import Sequence from '../sequence/Sequence';
import { fetchSequenceMetadata, checkBlockCompletion, saveSequencePosition } from '../../data/course-blocks';
import { createSequenceIdList } from '../utils';

function SequenceContainer(props) {
  const {
    courseUsageKey,
    courseId,
    sequenceId,
    unitId,
    intl,
    onNext,
    onPrevious,
    fetchState,
    displayName,
    showCompletion,
    isTimeLimited,
    savePosition,
    bannerText,
    gatedContent,
    position,
    items,
    lmsWebUrl,
    models,
  } = props;
  const loaded = fetchState === 'loaded';

  const unitIds = useMemo(() => items.map(({ id }) => id), [items]);
  const sequenceIds = useMemo(() => createSequenceIdList(models, courseId), [models, courseId]);

  useEffect(() => {
    props.fetchSequenceMetadata(sequenceId);
  }, [sequenceId]);

  useEffect(() => {
    if (savePosition) {
      const activeUnitIndex = unitIds.indexOf(unitId);
      props.saveSequencePosition(courseUsageKey, sequenceId, activeUnitIndex);
    }
  }, [unitId]);

  useEffect(() => {
    if (loaded && !unitId) {
      // The position may be null, in which case we'll just assume 0.
      const unitIndex = position || 0;
      const nextUnitId = unitIds[unitIndex];
      history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
    }
  }, [loaded, unitId]);

  const handleUnitNavigation = useCallback((nextUnitId) => {
    props.checkBlockCompletion(courseUsageKey, sequenceId, unitId);
    history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
  }, [courseUsageKey, sequenceId]);

  // Exam redirect
  useEffect(() => {
    if (isTimeLimited) {
      global.location.href = lmsWebUrl;
    }
  }, [isTimeLimited]);

  const isLoading = !loaded || !unitId || isTimeLimited;
  const isFirstUnit = sequenceIds.indexOf(sequenceId) === 0 && unitIds.indexOf(unitId) === 0;
  const isLastUnit = sequenceIds.indexOf(sequenceId) === sequenceIds.length - 1
    && unitIds.indexOf(unitId) === unitIds.length - 1;
  return (
    <div className="sequence-container">
      {isLoading ? (
        <PageLoading
          srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
        />
      ) : (
        <Sequence
          activeUnitId={unitId}
          bannerText={bannerText}
          courseUsageKey={courseUsageKey}
          displayName={displayName}
          isFirstUnit={isFirstUnit}
          isGated={gatedContent.gated}
          isLastUnit={isLastUnit}
          onNavigateUnit={handleUnitNavigation}
          onNext={onNext}
          onPrevious={onPrevious}
          prerequisite={{
            id: gatedContent.prereqId,
            name: gatedContent.gatedSectionName,
          }}
          showCompletion={showCompletion}
          unitIds={unitIds}
        />
      )}
    </div>

  );
}

SequenceContainer.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  intl: intlShape.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
  })),
  gatedContent: PropTypes.shape({
    gated: PropTypes.bool,
    gatedSectionName: PropTypes.string,
    prereqId: PropTypes.string,
  }),
  models: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.string),
    parentId: PropTypes.string,
  })).isRequired,
  checkBlockCompletion: PropTypes.func.isRequired,
  fetchSequenceMetadata: PropTypes.func.isRequired,
  saveSequencePosition: PropTypes.func.isRequired,
  savePosition: PropTypes.bool,
  lmsWebUrl: PropTypes.string,
  position: PropTypes.number,
  fetchState: PropTypes.string,
  displayName: PropTypes.string,
  showCompletion: PropTypes.bool,
  isTimeLimited: PropTypes.bool,
  bannerText: PropTypes.string,
};

SequenceContainer.defaultProps = {
  unitId: undefined,
  gatedContent: undefined,
  showCompletion: false,
  lmsWebUrl: undefined,
  position: undefined,
  fetchState: undefined,
  displayName: undefined,
  isTimeLimited: undefined,
  bannerText: undefined,
  savePosition: undefined,
  items: [],
};

export default connect(
  (state, props) => ({
    ...state.courseBlocks.blocks[props.sequenceId],
  }),
  {
    fetchSequenceMetadata,
    checkBlockCompletion,
    saveSequencePosition,
  },
)(injectIntl(SequenceContainer));
