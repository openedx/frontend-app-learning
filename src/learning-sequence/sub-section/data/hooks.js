import { useState, useEffect } from 'react';

import { getSubSectionMetadata } from './api';

export function useSubSectionMetadata(courseId, subSectionId) {
  const [metadata, setMetadata] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    getSubSectionMetadata(courseId, subSectionId).then((data) => {
      setMetadata(data);
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
