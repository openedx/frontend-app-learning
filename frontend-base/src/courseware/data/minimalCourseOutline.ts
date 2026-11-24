// The learning-sequences outline (GET /api/learning_sequences/v1/course_outline/), as
// `normalizeMinimalCourseOutline` shapes it.

// The learning-sequences outline keeps only structure and titles; the sequence's full shape is
// `SequenceMetadata`, from /api/courseware/sequence/.
export interface MinimalSequenceMetadata {
  id: string;
  title: string;
  sectionId?: string;
}

export interface MinimalSectionMetadata {
  id: string;
  title: string;
  sequenceIds: string[];
  courseId: string;
}

export interface MinimalCourseMetadata {
  id: string;
  title: string;
  sectionIds: string[];
  hasScheduledContent: boolean;
}

export interface MinimalCourseOutline {
  courses: Record<string, MinimalCourseMetadata>;
  sections: Record<string, MinimalSectionMetadata>;
  sequences: Record<string, MinimalSequenceMetadata>;
}

// Names only the fields `normalizeMinimalCourseOutline` reads; the endpoint returns more, left reachable as `unknown`.

interface CourseOutlineResponseSequence {
  id: string;
  title: string;
  accessible: boolean;
  effective_start: string | null;
  [key: string]: unknown;
}

interface CourseOutlineResponseSection {
  id: string;
  title: string;
  sequence_ids: string[];
  effective_start: string | null;
  [key: string]: unknown;
}

interface CourseOutlineResponse {
  course_key: string;
  title: string;
  outline: {
    sections: CourseOutlineResponseSection[];
    sequences: Record<string, CourseOutlineResponseSequence>;
  };
  [key: string]: unknown;
}

export function normalizeMinimalCourseOutline(learningSequencesData: CourseOutlineResponse): MinimalCourseOutline {
  const models: MinimalCourseOutline = {
    courses: {},
    sections: {},
    sequences: {},
  };

  const now = Date.now();
  function isReleased(block: { accessible?: boolean; effective_start: string | null }) {
    // We check whether the backend marks this as accessible because staff users are granted access anyway.
    // Note that sections don't have the `accessible` field and will just be checking `effective_start`.
    return block.accessible || !block.effective_start || now >= Date.parse(block.effective_start);
  }

  // Sequences
  Object.entries(learningSequencesData.outline.sequences).forEach(([seqId, sequence]) => {
    if (!isReleased(sequence)) {
      return; // Don't let the learner see unreleased sequences
    }

    models.sequences[seqId] = {
      id: seqId,
      title: sequence.title,
    };
  });

  // Sections
  learningSequencesData.outline.sections.forEach(section => {
    // Filter out any ignored sequences (e.g. unreleased sequences)
    const availableSequenceIds = section.sequence_ids.filter(seqId => seqId in models.sequences);

    // If we are unreleased and already stripped out all our children, just don't show us at all.
    // (We check both release date and children because children will exist for an unreleased section even for staff,
    // so we still want to show this section.)
    if (!isReleased(section) && availableSequenceIds.length === 0) {
      return;
    }

    models.sections[section.id] = {
      id: section.id,
      title: section.title,
      sequenceIds: availableSequenceIds,
      courseId: learningSequencesData.course_key,
    };

    // Add back-references to this section for all child sequences.
    availableSequenceIds.forEach(childSeqId => {
      models.sequences[childSeqId].sectionId = section.id;
    });
  });

  // Course
  models.courses[learningSequencesData.course_key] = {
    id: learningSequencesData.course_key,
    title: learningSequencesData.title,
    sectionIds: Object.entries(models.sections).map(([sectionId]) => sectionId),

    // Scan through all the sequences and look for ones that aren't released yet.
    hasScheduledContent: Object.values(learningSequencesData.outline.sequences).some(seq => !isReleased(seq)),
  };

  return models;
}
