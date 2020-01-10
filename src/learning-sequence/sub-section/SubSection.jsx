import React, { useContext } from 'react';

import SubSectionNavigation from './SubSectionNavigation';
import CourseStructureContext from '../CourseStructureContext';
import Unit from './Unit';
import {
  useSubSectionMetadata,
  useExamRedirect,
  usePersistentUnitPosition
} from './data/hooks';

export default function SubSection() {
  const {
    courseId,
    subSectionId,
    unitId,
    blocks,
  } = useContext(CourseStructureContext);
  const { metadata } = useSubSectionMetadata(courseId, subSectionId);
  usePersistentUnitPosition(courseId, subSectionId, unitId, metadata);
  useExamRedirect(metadata, blocks);

  const ready = blocks !== null && metadata !== null;

  return ready && (
    <section className="d-flex flex-column flex-grow-1">
      <SubSectionNavigation />
      <Unit id={unitId} unit={blocks[unitId]} />
    </section>
  );
}
