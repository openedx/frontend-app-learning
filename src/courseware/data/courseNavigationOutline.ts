import { logInfo } from '@edx/frontend-platform/logging';

// The navigation sidebar's outline (GET /api/course_home/v1/navigation/), as
// `normalizeCourseNavigationOutline` shapes it.

export interface CourseNavigationUnit {
  complete: boolean;
  icon?: string | null;
  id: string;
  title: string;
  type: string;
}

export interface CourseNavigationSequence {
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

export interface CourseNavigationSection {
  complete: boolean;
  id: string;
  title: string;
  sequenceIds: string[];
  completionStat: {
    completed: number;
    total: number;
  };
}

export interface CourseNavigationOutline {
  units: Record<string, CourseNavigationUnit>;
  sequences: Record<string, CourseNavigationSequence>;
  sections: Record<string, CourseNavigationSection>;
}

// Names only the fields `normalizeCourseNavigationOutline` reads; the endpoint returns more, left
// reachable as `unknown`.
// One entry of the response's `blocks`.
interface CourseNavigationBlockResponse {
  id: string;
  type: string;
  display_name: string;
  complete: boolean;
  children: string[];
  icon: string | null;
  completion_stat: { completion: number; completable_children: number };
  special_exam_info?: string;
  [key: string]: unknown;
}

export function normalizeCourseNavigationOutline(
  blocks: Record<string, CourseNavigationBlockResponse>,
): CourseNavigationOutline {
  const models: CourseNavigationOutline = {
    sections: {},
    sequences: {},
    units: {},
  };
  Object.values(blocks).forEach(block => {
    switch (block.type) {
      case 'chapter':
        models.sections[block.id] = {
          complete: block.complete,
          id: block.id,
          title: block.display_name,
          sequenceIds: block.children || [],
          completionStat: {
            completed: block.completion_stat?.completion,
            total: block.completion_stat?.completable_children,
          },
        };
        break;

      case 'sequential':
      case 'lock':
        models.sequences[block.id] = {
          complete: block.complete,
          id: block.id,
          title: block.display_name,
          type: block.type,
          specialExamInfo: block.special_exam_info,
          unitIds: block.children || [],
          completionStat: {
            completed: block.completion_stat?.completion,
            total: block.completion_stat?.completable_children,
          },
        };
        break;

      case 'vertical':
        models.units[block.id] = {
          complete: block.complete,
          icon: block.icon,
          id: block.id,
          title: block.display_name,
          type: block.type,
        };
        break;

      default:
        logInfo(`Unexpected course block type: ${block.type} with ID ${block.id}.  Expected block types are course, chapter, and sequential.`);
    }
  });

  return models;
}

/**
 * Mark a unit complete in the outline and roll the completion up through its
 * sequence and section. Returns the updated outline plus `refetchNeeded`, true when
 * completing the sequence may unlock a prerequisite-gated sibling (the section holds
 * a locked sequence), meaning the outline should be refetched from the server.
 */
export function applyUnitCompletion(outline: CourseNavigationOutline, unitId: string): {
  outline: CourseNavigationOutline;
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
