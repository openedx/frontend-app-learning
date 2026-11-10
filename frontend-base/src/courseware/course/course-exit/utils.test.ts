import { createIntl, getAnalyticsService } from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useMinimalCourseOutline } from '@src/courseware/data/apiHooks';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import {
  COURSE_EXIT_MODES, getCourseExitMode, GetCourseExitNavigation, logClick, logVisit,
} from './utils';

// Both courseware queries are stubs until https://github.com/openedx/frontend-app-learning/issues/2195, so the cases supply their data.
jest.mock('@src/courseware/data/apiHooks');

const courseId = 'course-v1:OpenedX+DemoX+DemoCourse';
const sendTrackEvent = getAnalyticsService().sendTrackEvent as jest.Mock;

beforeEach(() => {
  sendTrackEvent.mockClear();
});

describe('getCourseExitMode', () => {
  it('treats an omitted canImmediatelyViewCertificate as false', () => {
    // An enrolled learner who is not passing, with no certificate data; the exit page flag is left unset.
    expect(getCourseExitMode(null, false, true, false)).toBe(COURSE_EXIT_MODES.celebration);
    expect(getCourseExitMode(null, false, true, false, undefined, true)).toBe(COURSE_EXIT_MODES.nonPassing);
  });

  interface ExitModeInputs {
    certificateData?: { certStatus: string } | null;
    hasScheduledContent?: boolean;
    isEnrolled?: boolean;
    userHasPassingGrade?: boolean;
    courseExitPageIsActive?: boolean | null;
    canImmediatelyViewCertificate?: boolean;
    entranceExamPassed?: boolean | null;
  }

  // TypeScript reads the JavaScript function's `= null` defaults as null-only parameters, which a boolean does not fit.
  const getTypedCourseExitMode = getCourseExitMode as (...inputs: unknown[]) => number;

  // An enrolled learner with a passing grade who can view a certificate now, unless the case says otherwise.
  const exitMode = ({
    certificateData = null,
    hasScheduledContent = false,
    isEnrolled = true,
    userHasPassingGrade = true,
    courseExitPageIsActive = null,
    canImmediatelyViewCertificate = true,
    entranceExamPassed = null,
  }: ExitModeInputs) => getTypedCourseExitMode(
    certificateData,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
    courseExitPageIsActive,
    canImmediatelyViewCertificate,
    entranceExamPassed,
  );

  it.each<[string, ExitModeInputs, number]>([
    ['entranceExamFail when the entrance exam was not passed', { entranceExamPassed: false }, COURSE_EXIT_MODES.entranceExamFail],
    ['disabled when the course exit page is switched off', { courseExitPageIsActive: false }, COURSE_EXIT_MODES.disabled],
    ['disabled for a learner who is not enrolled', { isEnrolled: false }, COURSE_EXIT_MODES.disabled],
    ['inProgress for a learner who is not passing while content is still scheduled', { userHasPassingGrade: false, hasScheduledContent: true }, COURSE_EXIT_MODES.inProgress],
    ['nonPassing for a learner who is not passing', { userHasPassingGrade: false }, COURSE_EXIT_MODES.nonPassing],
    ['celebration for a passing learner with no certificate data', {}, COURSE_EXIT_MODES.celebration],
    ['celebration for a certificate status that celebrates', { certificateData: { certStatus: 'downloadable' } }, COURSE_EXIT_MODES.celebration],
    ['celebration for an audit learner who is not passing, since audit_passing earns no certificate', { certificateData: { certStatus: 'audit_passing' }, userHasPassingGrade: false }, COURSE_EXIT_MODES.celebration],
    ['disabled for a certificate status that does not celebrate', { certificateData: { certStatus: 'notpassing' } }, COURSE_EXIT_MODES.disabled],
  ])('is %s', (_name, inputs, expected) => {
    expect(exitMode(inputs)).toBe(expected);
  });
});

describe('GetCourseExitNavigation', () => {
  const intl = createIntl({ locale: 'en', messages: {} });
  let queryClient: QueryClient;

  interface ExitNavigationInputs {
    isEnrolled?: boolean;
    userHasPassingGrade?: boolean;
    entranceExamPassed?: boolean | null;
    hasScheduledContent?: boolean;
  }

  // An enrolled learner with a passing grade who can view a certificate now, unless the case says otherwise.
  const exitNavigation = ({
    isEnrolled = true,
    userHasPassingGrade = true,
    entranceExamPassed = null,
    hasScheduledContent = false,
  }: ExitNavigationInputs) => {
    (useCoursewareMetadata as jest.Mock).mockReturnValue({
      data: { isEnrolled, userHasPassingGrade, entranceExamData: { entranceExamPassed } },
    });
    (useMinimalCourseOutline as jest.Mock).mockReturnValue({
      data: { courses: { [courseId]: { hasScheduledContent } } },
    });
    seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, { canViewCertificate: true });

    return renderHook(() => GetCourseExitNavigation(courseId, intl), {
      wrapper: ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client: queryClient }, children),
    }).result.current;
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  it.each<[string, ExitNavigationInputs, { exitActive: boolean; exitText: string | null }]>([
    ['active with the complete text for a passing learner', {}, { exitActive: true, exitText: 'Complete the course' }],
    ['active with the end-of-course text for a learner who is not passing', { userHasPassingGrade: false }, { exitActive: true, exitText: 'Next (end of course)' }],
    ['active with no text for a learner who is not passing while content is still scheduled', { userHasPassingGrade: false, hasScheduledContent: true }, { exitActive: true, exitText: null }],
    ['inactive with no text for a learner who is not enrolled', { isEnrolled: false }, { exitActive: false, exitText: null }],
    ['inactive with no text when the entrance exam was not passed', { entranceExamPassed: false }, { exitActive: false, exitText: null }],
  ])('is %s', (_name, inputs, expected) => {
    expect(exitNavigation(inputs)).toEqual(expected);
  });
});

describe('logClick', () => {
  it('sends the clicked event named after the event, with the extra properties', () => {
    logClick('OpenedX', courseId, false, 'view_cert_button', { type: 'viewable' });

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.view_cert_button.clicked', {
      org_key: 'OpenedX',
      courserun_key: courseId,
      is_staff: false,
      type: 'viewable',
    });
  });

  it('sends nothing for a falsy event', () => {
    logClick('OpenedX', courseId, false, null);

    expect(sendTrackEvent).not.toHaveBeenCalled();
  });
});

describe('logVisit', () => {
  it('sends the visited event with the variant', () => {
    logVisit('OpenedX', courseId, true, 'celebration');

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.visited', {
      org_key: 'OpenedX',
      courserun_key: courseId,
      is_staff: true,
      variant: 'celebration',
    });
  });

  it('sends nothing for a falsy variant', () => {
    logVisit('OpenedX', courseId, true, null);

    expect(sendTrackEvent).not.toHaveBeenCalled();
  });
});
