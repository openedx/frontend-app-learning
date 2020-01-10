import { useState, useEffect } from 'react';
import { camelCaseObject } from '@edx/frontend-platform';

import { getSubSectionMetadata, saveSubSectionPosition } from './api';

export function useSubSectionMetadata(courseId, subSectionId) {
  const [metadata, setMetadata] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    getSubSectionMetadata(courseId, subSectionId).then((data) => {
      setMetadata(camelCaseObject(data));
      setLoaded(true);
    });
  }, [courseId, subSectionId]);

  return {
    metadata,
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
export function usePersistentUnitPosition(courseId, subSectionId, unitId, subSectionMetadata) {
  useEffect(() => {
    // All values must be defined to function
    const hasNeededData = courseId && subSectionId && unitId && subSectionMetadata;
    if (!hasNeededData) {
      return;
    }

    const { items, savePosition } = subSectionMetadata;

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
    saveSubSectionPosition(courseId, subSectionId, newPosition);
  }, [courseId, subSectionId, unitId, subSectionMetadata]);
}
