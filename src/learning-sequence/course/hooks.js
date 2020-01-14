/* eslint-disable no-plusplus */
import { useState, useEffect, useContext } from 'react';
import { camelCaseObject, history } from '@edx/frontend-platform';

import { getSequenceMetadata, saveSequencePosition } from './api';
import CourseStructureContext from '../CourseStructureContext';

export function useLoadSequenceMetadata(courseUsageKey, sequenceId) {
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

export function useExamRedirect(metadata, blocks) {
  useEffect(() => {
    if (metadata !== null && blocks !== null) {
      if (metadata.isTimeLimited) {
        global.location.href = blocks[metadata.itemId].lmsWebUrl;
      }
    }
  }, [metadata, blocks]);
}

/**
 * Save the position of current unit the subsection
 */
export function usePersistentUnitPosition(courseUsageKey, sequenceId, unitId, sequenceMetadata) {
  useEffect(() => {
    // All values must be defined to function
    const hasNeededData = courseUsageKey && sequenceId && unitId && sequenceMetadata;
    if (!hasNeededData) {
      return;
    }

    const { items, savePosition } = sequenceMetadata;

    // A sub-section can individually specify whether positions should be saved
    if (!savePosition) {
      return;
    }

    const unitIndex = items.findIndex(({ id }) => unitId === id);
    // "position" is a 1-indexed value due to legacy compatibility concerns.
    // TODO: Make this value 0-indexed
    const newPosition = unitIndex + 1;

    // TODO: update the local understanding of the position and
    // don't make requests to update the position if they still match?
    saveSequencePosition(courseUsageKey, sequenceId, newPosition);
  }, [courseUsageKey, sequenceId, unitId, sequenceMetadata]);
}

export function useMissingUnitRedirect(metadata, loaded) {
  const { courseUsageKey, sequenceId, unitId } = useContext(CourseStructureContext);
  useEffect(() => {
    if (loaded && metadata.itemId === sequenceId && !unitId) {
      // Position comes from the server as a 1-indexed array index.  Convert it to 0-indexed.
      const position = metadata.position - 1;
      const nextUnitId = metadata.items[position].id;
      history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
    }
  }, [loaded, metadata, unitId]);
}
