import { readFileSync } from 'fs';
import path from 'path';

import {
  getUrlByRouteRole,
  mergeSiteConfig,
  providesCourseBarMasqueradeRolesId,
  providesCourseBarRolesId,
} from '@openedx/frontend-base';

import { learningApp } from './index';
import { coursewareSearchApp } from './widgets/CoursewareSearch';
import { coursewareTabApp } from './widgets/CoursewareTab';
import { datesTabApp } from './widgets/DatesTab';
import { discussionsSidebarApp } from './widgets/DiscussionsSidebar';
import { learningHeaderApp } from './widgets/LearningHeader';
import { liveTabApp } from './widgets/LiveTab';
import { outlineTabApp } from './widgets/OutlineTab';
import { progressTabApp } from './widgets/ProgressTab';
import {
  courseDatesRole,
  courseOutlineRole,
  courseProgressRole,
  coursewareRole,
  learningCourseRole,
  learningRole,
} from './constants';

const [main] = learningApp.routes ?? [];
const [pathFixes] = main.children ?? [];
const [course, preview, ...nonCourse] = pathFixes.children ?? [];

describe('learningApp', () => {
  it('declares the Learning app id and the slot operations of its widgets', () => {
    expect(learningApp.appId).toBe('org.openedx.frontend.app.learning');
    expect(learningApp.slots).toEqual([
      ...(learningHeaderApp.slots ?? []),
      ...(coursewareSearchApp.slots ?? []),
      ...(discussionsSidebarApp.slots ?? []),
      ...(outlineTabApp.slots ?? []),
      ...(datesTabApp.slots ?? []),
      ...(progressTabApp.slots ?? []),
      ...(liveTabApp.slots ?? []),
      ...(coursewareTabApp.slots ?? []),
    ]);
  });

  it('provides the course role to the course bar and the masquerade bar', () => {
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
    expect((preview.children ?? []).map((route) => [route.index ? '(index)' : route.path, route.handle?.roles])).toEqual([
      ['(index)', undefined],
      [':sequenceId', [coursewareRole]],
      [':sequenceId/:unitId', [coursewareRole]],
    ]);
    expect(nonCourse.map((route) => [route.path, route.handle?.roles])).toEqual([
      ['goal-unsubscribe/:token', undefined],
      ['redirect', undefined],
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

describe('defaultConfig', () => {
  it('lists the keys the README lists, in its order', () => {
    const readme = readFileSync(path.join(__dirname, '..', 'README.rst'), 'utf8');
    const [, section = ''] = /\nConfiguration\n=+\n([\s\S]*?)\n\*{5,}\n/.exec(readme) ?? [];
    const readmeKeys = [...section.matchAll(/^- ``([A-Z_]+)``$/gm)].map(([, key]) => key);

    expect(readmeKeys.length).toBeGreaterThan(0);
    expect(Object.keys(learningApp.defaultConfig ?? {})).toEqual(readmeKeys);
  });
});
