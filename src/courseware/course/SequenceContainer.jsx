/* eslint-disable no-plusplus */
import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history, camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import messages from '../messages';
import PageLoading from '../PageLoading';
import Sequence from '../sequence/Sequence';
import UserMessagesContext from '../../user-messages/UserMessagesContext';

export async function getSequenceMetadata(courseUsageKey, sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceId}`, {});

  return data;
}

function useLoadSequence(courseUsageKey, sequenceId) {
  const [metadata, setMetadata] = useState(null);
  const [units, setUnits] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setMetadata(null);
    getSequenceMetadata(courseUsageKey, sequenceId).then((data) => {
      const unitsMap = {};
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        unitsMap[item.id] = camelCaseObject(item);
      }

      setMetadata(camelCaseObject(data));
      setUnits(unitsMap);
      setLoaded(true);
    });
  }, [courseUsageKey, sequenceId]);

  return {
    metadata,
    units,
    loaded,
  };
}

function SequenceContainer({
  courseUsageKey, courseId, sequenceId, unitId, models, intl, onNext, onPrevious,
}) {
  const { metadata, loaded, units } = useLoadSequence(courseUsageKey, sequenceId);

  useEffect(() => {
    if (loaded && !unitId) {
      // The position may be null, in which case we'll just assume 0.
      const position = metadata.position !== null ? metadata.position - 1 : 0;
      const nextUnitId = metadata.items[position].id;
      history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
    }
  }, [loaded, metadata, unitId]);

  const handleUnitNavigation = useCallback((nextUnitId) => {
    history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
  }, [courseUsageKey, sequenceId]);

  const { add, remove } = useContext(UserMessagesContext);
  useEffect(() => {
    let id = null;
    if (metadata && metadata.bannerText) {
      id = add({
        code: null,
        dismissible: false,
        text: metadata.bannerText,
        type: 'info',
        topic: 'sequence',
      });
    }
    return () => {
      if (id) {
        remove(id);
      }
    };
  }, [metadata]);

  // Exam redirect
  useEffect(() => {
    if (metadata && models) {
      if (metadata.isTimeLimited) {
        global.location.href = models[sequenceId].lmsWebUrl;
      }
    }
  }, [metadata, models]);

  if (!loaded || !unitId || (metadata && metadata.isTimeLimited)) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  const {
    displayName,
    showCompletion,
    isTimeLimited,
    savePosition,
    bannerText,
    gatedContent,
  } = metadata;

  const prerequisite = {
    id: gatedContent.prereqId,
    name: gatedContent.gatedSectionName,
  };

  return (
    <Sequence
      id={sequenceId}
      courseUsageKey={courseUsageKey}
      courseId={courseId}
      unitIds={metadata.items.map((item) => item.id)}
      units={units}
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
  models: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    lmsWebUrl: PropTypes.string.isRequired,
  })).isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  intl: intlShape.isRequired,
};

SequenceContainer.defaultProps = {
  unitId: null,
};
export default injectIntl(SequenceContainer);
