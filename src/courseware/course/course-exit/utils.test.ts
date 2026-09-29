import { initializeMockApp } from '@src/setupTest';
import { COURSE_EXIT_MODES, getCourseExitMode } from './utils';

initializeMockApp();

describe('getCourseExitMode', () => {
  it('treats an omitted canImmediatelyViewCertificate as false', () => {
    // An enrolled learner who is not passing, with no certificate data; the exit page flag is left unset.
    expect(getCourseExitMode(null, false, true, false)).toBe(COURSE_EXIT_MODES.celebration);
    expect(getCourseExitMode(null, false, true, false, undefined, true)).toBe(COURSE_EXIT_MODES.nonPassing);
  });
});
