import { getLoggingService, MockLoggingService } from '@openedx/frontend-base';
import { normalizeCourseHomeOutline, normalizeCourseHomeOutlineBlocks } from './courseHomeOutline';

const loggingService = getLoggingService() as MockLoggingService;

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
  const withChildren = (outlineBlock: ReturnType<typeof block>, children: unknown) => (
    { ...outlineBlock, children } as unknown as ReturnType<typeof block>
  );

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

  it('gives a course or section with no children an empty child list', () => {
    const outline = normalizeCourseHomeOutlineBlocks(courseId, {
      course: withChildren(block('course', 'course'), undefined),
      section: withChildren(block('section', 'chapter'), undefined),
    });

    expect(outline.courses.course.sectionIds).toEqual([]);
    expect(outline.sections.section.sequenceIds).toEqual([]);
  });

  it('links no children of a course or section whose children are not a list', () => {
    const outline = normalizeCourseHomeOutlineBlocks(courseId, {
      course: withChildren(block('course', 'course'), 'section'),
      section: withChildren(block('section', 'chapter'), 'sequence'),
      sequence: block('sequence', 'sequential'),
    });

    expect(outline.sections.section.courseId).toBeUndefined();
    expect(outline.sequences.sequence.sectionId).toBeUndefined();
  });
});

describe('normalizeCourseHomeOutline', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const response = {
    access_expiration: { expiration_date: '2030-01-01T00:00:00Z' },
    cert_data: null,
    course_blocks: null,
    course_goals: { selected_goal: null, weekly_learning_goal_enabled: true },
    course_tools: [],
    dates_banner_info: { content_type_gating_enabled: false },
    dates_widget: { course_date_blocks: [] },
    enable_proctored_exams: false,
    enroll_alert: { can_enroll: true, extra_text: '' },
    enrollment_mode: 'audit',
    handouts_html: '<p>Handouts</p>',
    has_ended: false,
    offer: null,
    resume_course: { has_visited_course: false, url: null },
    user_has_passing_grade: false,
    verified_mode: null,
    welcome_message_html: null,
  };

  it('camel-cases the outline and carries the time offset', () => {
    expect(normalizeCourseHomeOutline(courseId, response, 1500)).toEqual({
      accessExpiration: { expirationDate: '2030-01-01T00:00:00Z' },
      certData: null,
      courseBlocks: {},
      courseGoals: { selectedGoal: null, weeklyLearningGoalEnabled: true },
      courseTools: [],
      datesBannerInfo: { contentTypeGatingEnabled: false },
      datesWidget: { courseDateBlocks: [] },
      enableProctoredExams: false,
      enrollAlert: { canEnroll: true, extraText: '' },
      enrollmentMode: 'audit',
      handoutsHtml: '<p>Handouts</p>',
      hasScheduledContent: undefined,
      hasEnded: false,
      offer: null,
      resumeCourse: { hasVisitedCourse: false, url: null },
      timeOffsetMillis: 1500,
      userHasPassingGrade: false,
      verifiedMode: null,
      welcomeMessageHtml: '',
    });
  });

  it('normalizes the course blocks when the response has them', () => {
    const outline = normalizeCourseHomeOutline(courseId, { ...response, course_blocks: { blocks: {} } }, 0);
    expect(outline.courseBlocks).toEqual({ courses: {}, sections: {}, sequences: {} });
  });
});
