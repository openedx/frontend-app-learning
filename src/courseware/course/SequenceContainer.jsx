/* eslint-disable no-plusplus */
import React, { useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history } from '@edx/frontend-platform';

import messages from '../messages';
import PageLoading from '../PageLoading';
import Sequence from '../sequence/Sequence';
import UserMessagesContext from '../../user-messages/UserMessagesContext';
import { fetchSequenceMetadata, checkBlockCompletion } from '../../data/course-blocks/thunks';

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
    unitIds,
    lmsWebUrl,
  } = props;
  const loaded = fetchState === 'loaded';

  useEffect(() => {
    props.fetchSequenceMetadata(sequenceId);
  }, [sequenceId]);

  useEffect(() => {
    if (loaded && !unitId) {
      // The position may be null, in which case we'll just assume 0.
      const unitIndex = position !== null ? position - 1 : 0;
      const nextUnitId = unitIds[unitIndex];
      history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
    }
  }, [loaded, unitId]);

  const handleUnitNavigation = useCallback((nextUnitId) => {
    props.checkBlockCompletion(courseUsageKey, sequenceId, unitId);
    history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
  }, [courseUsageKey, sequenceId]);

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

  // Exam redirect
  useEffect(() => {
    if (isTimeLimited) {
      global.location.href = lmsWebUrl;
    }
  }, [isTimeLimited]);

  if (!loaded || !unitId || isTimeLimited) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  const prerequisite = {
    id: gatedContent.prereqId,
    name: gatedContent.gatedSectionName,
  };

  return (
    <Sequence
      id={sequenceId}
      courseUsageKey={courseUsageKey}
      courseId={courseId}
      unitIds={unitIds}
      displayName={displayName}
      activeUnitId={unitId}
      showCompletion={showCompletion}
      isTimeLimited={isTimeLimited}
      isGated={gatedContent.gated}
      savePosition={savePosition}
      bannerText={bannerText}
      onNext={onNext}
      onPrevious={onPrevious}
      onNavigateUnit={handleUnitNavigation}
      prerequisite={prerequisite}
    />
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
  unitIds: PropTypes.arrayOf(PropTypes.string),
  gatedContent: PropTypes.shape({
    gated: PropTypes.bool,
    gatedSectionName: PropTypes.string,
    prereqId: PropTypes.string,
  }),
  checkBlockCompletion: PropTypes.func.isRequired,
  fetchSequenceMetadata: PropTypes.func.isRequired,
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
  unitIds: [],
};

export default connect(
  (state, props) => ({
    ...state.courseBlocks.blocks[props.sequenceId],
    unitIds: state.courseBlocks.blocks[props.sequenceId].children,
  }),
  {
    fetchSequenceMetadata,
    checkBlockCompletion,
  },
)(injectIntl(SequenceContainer));
