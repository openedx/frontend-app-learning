import React from 'react';
import {
  MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import DecodePageRoute from '.';
import { DECODE_ROUTES } from '../constants';

jest.mock('@edx/frontend-platform/react', () => ({
  PageWrap: ({ children }) => children,
}));

const ROOT_PATHS = Object.values(DECODE_ROUTES).flatMap(
  (value) => (Array.isArray(value) ? [...value] : [value]),
).filter((path) => path.startsWith('/'));

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const punctuatedCourseId = 'course-v1:edX~Demo.X:2+Course.1~b+Run.2026-Q1';
const deprecatedCourseId = 'edX/DemoX/Demo_Course';
const deprecatedCourseIdWithPercent = 'edX/DemoX/Demo%2BCourse';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const discussionTopic = 'some+topic';

const deeplyEncode = (value: string) => {
  let encoded = encodeURIComponent(value);
  for (let i = 0; i < 5; i++) {
    encoded = encodeURIComponent(encoded);
  }
  return encoded;
};

const COURSE_KEYS = [
  {
    name: 'modern key',
    landsAs: courseId,
    spellings: [
      { name: 'unencoded', value: courseId },
      { name: 'encoded once', value: encodeURIComponent(courseId) },
      { name: 'encoded six times', value: deeplyEncode(courseId) },
    ],
  },
  {
    name: 'modern key with punctuation',
    landsAs: punctuatedCourseId,
    spellings: [
      { name: 'unencoded', value: punctuatedCourseId },
      { name: 'encoded once', value: encodeURIComponent(punctuatedCourseId) },
      { name: 'encoded six times', value: deeplyEncode(punctuatedCourseId) },
    ],
  },
  {
    name: 'deprecated key',
    landsAs: deprecatedCourseId,
    spellings: [
      { name: 'encoded once', value: encodeURIComponent(deprecatedCourseId) },
      { name: 'encoded six times', value: deeplyEncode(deprecatedCourseId) },
    ],
  },
  {
    name: 'deprecated key with a literal percent',
    landsAs: 'edX/DemoX/Demo+Course',
    spellings: [
      { name: 'encoded once', value: encodeURIComponent(deprecatedCourseIdWithPercent) },
      { name: 'encoded six times', value: deeplyEncode(deprecatedCourseIdWithPercent) },
    ],
  },
];

const ROUTE_TEMPLATES = [
  {
    name: 'access-denied',
    url: (key: string) => `/course/${key}/access-denied`,
    landing: (key: string) => `/course/${key}/access-denied`,
  },
  {
    name: 'home',
    url: (key: string) => `/course/${key}/home`,
    landing: (key: string) => `/course/${key}/home`,
  },
  {
    name: 'live',
    url: (key: string) => `/course/${key}/live`,
    landing: (key: string) => `/course/${key}/live`,
  },
  {
    name: 'dates',
    url: (key: string) => `/course/${key}/dates`,
    landing: (key: string) => `/course/${key}/dates`,
  },
  {
    name: 'course-end',
    url: (key: string) => `/course/${key}/course-end`,
    landing: (key: string) => `/course/${key}/course-end`,
  },
  {
    name: 'progress',
    url: (key: string) => `/course/${key}/progress`,
    landing: (key: string) => `/course/${key}/progress`,
  },
  {
    name: 'progress for a target user',
    url: (key: string) => `/course/${key}/progress/42`,
    landing: (key: string) => `/course/${key}/progress/42`,
  },
  {
    name: 'bare course',
    url: (key: string) => `/course/${key}`,
    landing: (key: string) => `/course/${key}`,
  },
  {
    name: 'courseware sequence',
    url: (key: string) => `/course/${key}/${encodeURIComponent(sequenceId)}`,
    landing: (key: string) => `/course/${key}/${sequenceId}`,
  },
  {
    name: 'courseware unit',
    url: (key: string) => `/course/${key}/${encodeURIComponent(sequenceId)}/${encodeURIComponent(unitId)}`,
    landing: (key: string) => `/course/${key}/${sequenceId}/${unitId}`,
  },
  {
    name: 'preview sequence',
    url: (key: string) => `/preview/course/${key}/${encodeURIComponent(sequenceId)}`,
    landing: (key: string) => `/preview/course/${key}/${sequenceId}`,
  },
  {
    name: 'preview unit',
    url: (key: string) => `/preview/course/${key}/${encodeURIComponent(sequenceId)}/${encodeURIComponent(unitId)}`,
    landing: (key: string) => `/preview/course/${key}/${sequenceId}/${unitId}`,
  },
  {
    name: 'discussion topic',
    url: (key: string) => `/course/${key}/discussion/topics/${encodeURIComponent(discussionTopic)}`,
    landing: (key: string) => `/course/${key}/discussion/topics/${discussionTopic}`,
  },
];

const COURSE_KEY_CASES = COURSE_KEYS.flatMap(
  (key) => key.spellings.flatMap(
    (spelling) => ROUTE_TEMPLATES.map((route) => ({
      name: `${route.name} · ${key.name} · ${spelling.name}`,
      url: route.url(spelling.value),
      landing: route.landing(key.landsAs),
    })),
  ),
);

const LandingProbe = () => <span data-testid="landing">{useLocation().pathname}</span>;

const landingPathname = (url: string) => {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        {ROOT_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={<DecodePageRoute><LandingProbe /></DecodePageRoute>}
          />
        ))}
        <Route path="*" element={<LandingProbe />} />
      </Routes>
    </MemoryRouter>,
  );

  return screen.getByTestId('landing').textContent;
};

describe('DecodePageRoute landing urls', () => {
  it.each(COURSE_KEY_CASES)('$name', ({ url, landing }) => {
    expect(landingPathname(url)).toEqual(landing);
  });

  it.each([
    {
      name: 'courseware unit, every segment unencoded',
      url: `/course/${courseId}/${sequenceId}/${unitId}`,
      landing: `/course/${courseId}/${sequenceId}/${unitId}`,
    },
    {
      name: 'courseware unit, only courseId encoded',
      url: `/course/${encodeURIComponent(courseId)}/${sequenceId}/${unitId}`,
      landing: `/course/${courseId}/${sequenceId}/${unitId}`,
    },
    {
      name: 'unit key containing an encoded slash',
      url: `/course/${encodeURIComponent(courseId)}/${encodeURIComponent(sequenceId)}/${encodeURIComponent('block-v1:a/b')}`,
      landing: `/course/${courseId}/${sequenceId}/block-v1:a/b`,
    },
    {
      name: 'mangled url with an encoded space, not a valid course key',
      url: `/course/${encodeURIComponent('course-v1:edX Demo+Run')}/home`,
      landing: '/course/course-v1:edX Demo+Run/home',
    },
  ])('$name', ({ url, landing }) => {
    expect(landingPathname(url)).toEqual(landing);
  });
});
