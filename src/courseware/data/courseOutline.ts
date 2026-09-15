// Types for the navigation-sidebar outline as produced by `normalizeOutlineBlocks`.

export interface CourseOutlineUnit {
  complete: boolean;
  icon?: string | null;
  id: string;
  title: string;
  type: string;
}

export interface CourseOutlineSequence {
  complete: boolean;
  id: string;
  title: string;
  type: string;
  specialExamInfo?: string;
  unitIds: string[];
  completionStat: {
    completed: number;
    total: number;
  };
}

export interface CourseOutlineSection {
  complete: boolean;
  id: string;
  title: string;
  sequenceIds: string[];
  completionStat: {
    completed: number;
    total: number;
  };
}

export interface CourseOutlineData {
  units: Record<string, CourseOutlineUnit>;
  sequences: Record<string, CourseOutlineSequence>;
  sections: Record<string, CourseOutlineSection>;
}

/**
 * Mark a unit complete in the outline and roll the completion up through its
 * sequence and section. Returns the updated outline plus `refetchNeeded`, true when
 * completing the sequence may unlock a prerequisite-gated sibling (the section holds
 * a locked sequence), meaning the outline should be refetched from the server.
 */
export function applyUnitCompletion(outline: CourseOutlineData, unitId: string): {
  outline: CourseOutlineData;
  refetchNeeded: boolean;
} {
  // The containing sequence is found by scanning unitIds: the outline tree is the
  // authority on where the unit lives.
  const sequenceId = Object.keys(outline.sequences)
    .find(id => outline.sequences[id].unitIds.includes(unitId));
  const sectionId = sequenceId && Object.keys(outline.sections)
    .find(id => outline.sections[id].sequenceIds.includes(sequenceId));
  if (!(unitId in outline.units) || !sequenceId || !sectionId) {
    return { outline, refetchNeeded: false }; // outline doesn't hold this unit; leave it untouched
  }

  const units = { ...outline.units, [unitId]: { ...outline.units[unitId], complete: true } };

  const sequenceUnits = outline.sequences[sequenceId].unitIds;
  const completedUnits = sequenceUnits.filter((id) => units[id].complete);
  const isAllUnitsAreComplete = sequenceUnits.every((id) => units[id].complete);

  const sequences = {
    ...outline.sequences,
    [sequenceId]: {
      ...outline.sequences[sequenceId],
      complete: isAllUnitsAreComplete || outline.sequences[sequenceId].complete,
      completionStat: {
        ...outline.sequences[sequenceId].completionStat,
        completed: completedUnits.length,
      },
    },
  };

  const sectionSequences = outline.sections[sectionId].sequenceIds;
  const isAllSequencesAreComplete = sectionSequences.every((id) => sequences[id].complete);
  const hasLockedSequence = sectionSequences.some((id) => sequences[id].type === 'lock');

  const sections = {
    ...outline.sections,
    [sectionId]: {
      ...outline.sections[sectionId],
      complete: isAllSequencesAreComplete || outline.sections[sectionId].complete,
      completionStat: {
        ...outline.sections[sectionId].completionStat,
        completed: sectionSequences.reduce((acc, id) => acc + sequences[id].completionStat.completed, 0),
      },
    },
  };

  return {
    outline: { units, sequences, sections },
    refetchNeeded: isAllUnitsAreComplete && hasLockedSequence,
  };
}
