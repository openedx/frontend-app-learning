import React, { useContext } from 'react';

import SubSectionNavigation from './SubSectionNavigation';
import CourseStructureContext from '../CourseStructureContext';
import Unit from './Unit';
import {
  useLoadSubSectionMetadata,
  useExamRedirect,
  usePersistentUnitPosition,
} from './data/hooks';
import SubSectionMetadataContext from './SubSectionMetadataContext';

export default function SubSection() {
  const {
    courseId,
    subSectionId,
    unitId,
    blocks,
  } = useContext(CourseStructureContext);
  const { metadata } = useLoadSubSectionMetadata(courseId, subSectionId);
  usePersistentUnitPosition(courseId, subSectionId, unitId, metadata);

  useExamRedirect(metadata, blocks);

  const ready = blocks !== null && metadata !== null;

  if (!ready) {
    return null;
  }

  const isGated = metadata.gatedContent.gated;

  return (
    <SubSectionMetadataContext.Provider value={metadata}>
      <section className="d-flex flex-column flex-grow-1">
        <SubSectionNavigation />
        {isGated && <div>This is gated content.</div>}
        {!isGated && <Unit id={unitId} unit={blocks[unitId]} />}
      </section>
    </SubSectionMetadataContext.Provider>
  );
}
