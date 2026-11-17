import { normalizeMinimalCourseOutline } from './minimalCourseOutline';

describe('normalizeMinimalCourseOutline', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const buildResponse = (secondSequenceAccessible: boolean) => ({
    course_key: courseId,
    title: 'Demo Course',
    outline: {
      sections: [
        {
          id: 'section-1', title: 'Released', sequence_ids: ['sequence-1'], effective_start: null,
        },
        {
          id: 'section-2', title: 'Unreleased', sequence_ids: ['sequence-2'], effective_start: future,
        },
      ],
      sequences: {
        'sequence-1': {
          id: 'sequence-1', title: 'One', accessible: true, effective_start: null,
        },
        'sequence-2': {
          id: 'sequence-2', title: 'Two', accessible: secondSequenceAccessible, effective_start: future,
        },
      },
    },
  });

  it('omits an unreleased section whose sequences are all unreleased', () => {
    const outline = normalizeMinimalCourseOutline(buildResponse(false));

    expect(outline.sections).toEqual({
      'section-1': {
        id: 'section-1', title: 'Released', sequenceIds: ['sequence-1'], courseId,
      },
    });
    expect(outline.sequences).toEqual({
      'sequence-1': { id: 'sequence-1', title: 'One', sectionId: 'section-1' },
    });
    expect(outline.courses[courseId]).toEqual({
      id: courseId, title: 'Demo Course', sectionIds: ['section-1'], hasScheduledContent: true,
    });
  });

  it('keeps an unreleased section whose sequence the backend marks accessible', () => {
    const outline = normalizeMinimalCourseOutline(buildResponse(true));

    expect(outline.sections['section-2']).toEqual({
      id: 'section-2', title: 'Unreleased', sequenceIds: ['sequence-2'], courseId,
    });
    expect(outline.sequences['sequence-2']).toEqual({ id: 'sequence-2', title: 'Two', sectionId: 'section-2' });
    expect(outline.courses[courseId].sectionIds).toEqual(['section-1', 'section-2']);
    expect(outline.courses[courseId].hasScheduledContent).toBe(false);
  });
});
