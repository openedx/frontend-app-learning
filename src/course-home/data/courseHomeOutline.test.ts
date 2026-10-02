import { initializeMockApp } from '../../setupTest';
import { normalizeCourseHomeOutlineBlocks } from './courseHomeOutline';

const { loggingService } = initializeMockApp();

describe('normalizeCourseHomeOutlineBlocks', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const block = (id: string, type: string, children: string[] = []) => ({
    id,
    type,
    display_name: id,
    children,
    complete: false,
    description: null,
    due: null,
    effort_activities: null,
    effort_time: null,
    icon: null,
    lms_web_url: null,
    resume_block: false,
    has_scheduled_content: null,
    hide_from_toc: null,
  });

  it('logs and skips a block of an unexpected type', () => {
    const outline = normalizeCourseHomeOutlineBlocks(courseId, {
      course: block('course', 'course', ['section']),
      section: block('section', 'chapter', ['sequence']),
      sequence: block('sequence', 'sequential'),
      unit: block('unit', 'vertical'),
    });

    expect(Object.keys(outline.sequences)).toEqual(['sequence']);
    expect(loggingService.logInfo).toHaveBeenCalledWith(
      'Unexpected course block type: vertical with ID unit.  Expected block types are course, chapter, and sequential.',
      undefined,
    );
  });

  it('logs a section child that is not among the sequences and keeps it in the section', () => {
    const outline = normalizeCourseHomeOutlineBlocks(courseId, {
      course: block('course', 'course', ['section']),
      section: block('section', 'chapter', ['sequence', 'missing']),
      sequence: block('sequence', 'sequential'),
    });

    expect(outline.sections.section.sequenceIds).toEqual(['sequence', 'missing']);
    expect(outline.sequences.sequence.sectionId).toBe('section');
    expect(loggingService.logInfo).toHaveBeenCalledWith(
      'Section section has child block missing, but that block is not in the list of sequences.',
      undefined,
    );
  });
});
