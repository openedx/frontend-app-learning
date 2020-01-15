/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history, camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import messages from '../messages';
import PageLoading from '../PageLoading';
import Sequence from '../sequence/Sequence';

export async function getSequenceMetadata(courseUsageKey, sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/xblock/${sequenceId}/handler/xmodule_handler/metadata`, {});

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
      const position = metadata.position - 1;
      const nextUnitId = metadata.items[position].id;
      history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
    }
  }, [loaded, metadata, unitId]);

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
      unitIds={metadata.items.map(item => item.id)}
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
  unitId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SequenceContainer);
