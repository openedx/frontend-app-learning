import {
  getUrlByRouteRole,
  mergeSiteConfig,
  providesCourseBarMasqueradeRolesId,
  providesCourseBarRolesId,
} from '@openedx/frontend-base';

import { learningApp } from './index';
import {
  courseDatesRole,
  courseOutlineRole,
  courseProgressRole,
  coursewareRole,
  learningCourseRole,
  learningRole,
} from './constants';

const [main] = learningApp.routes ?? [];
const [course, preview, ...nonCourse] = main.children ?? [];

describe('learningApp', () => {
  it('declares the Learning app id with no slot operations yet', () => {
    expect(learningApp.appId).toBe('org.openedx.frontend.app.learning');
    expect(learningApp.slots).toEqual([]);
  });

  it('provides the course role for the course bar and the masquerade bar', () => {
    expect(learningApp.provides).toEqual({
      [providesCourseBarRolesId]: [learningCourseRole],
      [providesCourseBarMasqueradeRolesId]: [learningCourseRole],
    });
  });

  it('declares the learning role on the root route', () => {
    expect(main.path).toBe('learning');
    expect(main.handle?.roles).toEqual([learningRole]);
  });

  it('declares the course role on the course and preview layout routes', () => {
    expect(course.path).toBe('course/:courseId');
    expect(course.handle?.roles).toEqual([learningCourseRole]);
    expect(preview.path).toBe('preview/course/:courseId');
    expect(preview.handle?.roles).toEqual([learningCourseRole]);
  });

  it('declares a destination role on four course pages and none on the rest', () => {
    const declaredRolesByCoursePath = Object.fromEntries(
      (course.children ?? []).map((route) => [route.index ? '(index)' : route.path, route.handle?.roles]),
    );
    expect(declaredRolesByCoursePath).toEqual({
      home: [courseOutlineRole],
      dates: [courseDatesRole],
      progress: [courseProgressRole],
      'progress/:targetUserId': [courseProgressRole],
      'discussion/:path/*': undefined,
      live: undefined,
      '(index)': [coursewareRole],
      ':sequenceId': [coursewareRole],
      ':sequenceId/:unitId': [coursewareRole],
      'course-end': undefined,
      'access-denied': undefined,
    });
    expect((preview.children ?? []).map((route) => [route.path, route.handle?.roles])).toEqual([
      [':sequenceId', [coursewareRole]],
      [':sequenceId/:unitId', [coursewareRole]],
    ]);
    expect(nonCourse.map((route) => [route.path, route.handle?.roles])).toEqual([
      ['goal-unsubscribe/:token', undefined],
      ['redirect/*', undefined],
      ['preferences-unsubscribe/:userToken/:updatePatch?', undefined],
    ]);
  });
});

describe('role resolution', () => {
  beforeAll(() => {
    mergeSiteConfig({ apps: [learningApp] });
  });

  it('learning resolves to the root, not to any page', () => {
    expect(getUrlByRouteRole(learningRole)).toBe('/learning');
  });

  it('learningCourse resolves to the course, which prefix-matches every tab', () => {
    expect(getUrlByRouteRole(learningCourseRole)).toBe('/learning/course/:courseId');
  });

  it('courseOutline resolves to the outline tab', () => {
    expect(getUrlByRouteRole(courseOutlineRole)).toBe('/learning/course/:courseId/home');
  });

  it('courseDates resolves to the dates tab', () => {
    expect(getUrlByRouteRole(courseDatesRole)).toBe('/learning/course/:courseId/dates');
  });

  it("courseProgress resolves to the learner's own progress, not another user's", () => {
    const url = getUrlByRouteRole(courseProgressRole);
    expect(url).toBe('/learning/course/:courseId/progress');
    expect(url).not.toMatch(/:targetUserId/);
  });

  it('courseware resolves to the bare course path (an index route, hence the slash), not a sequence, unit or preview path', () => {
    const url = getUrlByRouteRole(coursewareRole);
    expect(url).toBe('/learning/course/:courseId/');
    expect(url).not.toMatch(/:sequenceId|:unitId|preview/);
  });
});
