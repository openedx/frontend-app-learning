import { mockSpecialExams } from '@edx/frontend-lib-special-exams/testing';
import { getAppConfig, getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';
import type { ComponentProps, ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { appId } from '@src/constants';
import { CourseParamsProvider } from '@src/generic/course-params';
import { buildTopicsFromUnits } from '@src/courseware/data/__factories__/discussionTopics.factory';
import buildSimpleCourseAndSequenceMetadata from '@src/courseware/data/__factories__/sequenceMetadata.factory';
import { buildOutlineFromBlocks } from '@src/courseware/data/__factories__/learningSequencesOutline.factory';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import CourseQueryGate from './CourseQueryGate';
import MountCourseQueryHooks from './MountCourseQueryHooks';
import { render } from './render';

interface MockCourseRequestsOptions {
  courseMetadata?: object;
  courseHomeMetadata?: object;
  sequenceMetadata?: object[];
  unitBlocks?: object[];
  sectionBlocks?: object[];
  sequenceBlocks?: object[];
  // Hold the sequence metadata requests pending, as a slow sequence would.
  preventSequenceLoad?: boolean;
  // Hold the navigation sidebar's outline request pending.
  preventOutlineSidebarLoad?: boolean;
  // The navigation sidebar's toggles payload.
  enableCompletionTracking?: { enable_completion_tracking: boolean };
  // The course's discussion provider: only `openedx` has topics the discussions sidebar reads. Default: `legacy`.
  discussionsProvider?: string;
  // Whether each unit's discussion topic is enabled in context. Default: true.
  enabledInContext?: boolean;
}

/*
 * Mocks the requests the courseware page makes for a factory-built course: one section with one sequence and one
 * unit unless `options` supplies the blocks or payloads. Returns the built payloads, the mock adapter and the ids of
 * the first sequence and unit, and the special exams mock. the legacy app's `mockCourseRequests`, less the requests of
 * pieces not ported yet.
 */
export function mockCourseRequests(options: MockCourseRequestsOptions = {}) {
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  const { lmsBaseUrl } = getSiteConfig();

  const fixtures = buildSimpleCourseAndSequenceMetadata(options);
  const {
    courseBlocks, sequenceBlocks, unitBlocks, courseMetadata, sequenceMetadata, courseHomeMetadata,
  } = fixtures;
  const courseId: string = courseMetadata.id;

  axiosMock.onGet(appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/courseware/course/${courseId}`)).reply(200, courseMetadata);
  axiosMock.onGet(appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`))
    .reply(200, courseHomeMetadata);
  axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`))
    .reply(200, buildOutlineFromBlocks(courseBlocks));
  axiosMock.onGet(`${lmsBaseUrl}/api/discussion/v1/courses/${courseId}`)
    .reply(200, { provider: options.discussionsProvider ?? 'legacy' });
  axiosMock.onGet(`${lmsBaseUrl}/api/discussion/v2/course_topics/${courseId}`)
    .reply(200, buildTopicsFromUnits(unitBlocks, options.enabledInContext ?? true));
  axiosMock.onGet(`${lmsBaseUrl}/courses/${courseId}/courseware-navigation-sidebar/toggles/`)
    .reply(200, options.enableCompletionTracking ?? { enable_completion_tracking: true });
  const outlineSidebarUrl = `${lmsBaseUrl}/api/course_home/v1/navigation/${courseId}`;
  if (options.preventOutlineSidebarLoad) {
    axiosMock.onGet(outlineSidebarUrl).reply(() => new Promise(() => {}));
  } else {
    axiosMock.onGet(outlineSidebarUrl).reply(200, courseBlocks);
  }
  sequenceMetadata.forEach((metadata: { item_id: string }) => {
    const sequenceMetadataUrl = `${lmsBaseUrl}/api/courseware/sequence/${metadata.item_id}`;
    if (options.preventSequenceLoad) {
      axiosMock.onGet(sequenceMetadataUrl).reply(() => new Promise(() => {}));
    } else {
      axiosMock.onGet(sequenceMetadataUrl).reply(200, metadata);
    }
  });
  // The special exams library's stateful backend mock; exam tests drive it through `specialExams.setExam`. It reads
  // EXAMS_BASE_URL now, so a test that changes it does so before calling this.
  const specialExams = mockSpecialExams(axiosMock, courseId, {
    lmsBaseUrl, examsBaseUrl: getAppConfig(appId).EXAMS_BASE_URL as string | null | undefined,
  });

  return {
    ...fixtures,
    axiosMock,
    courseId,
    sequenceId: sequenceBlocks[0].id as string,
    unitId: unitBlocks[0]?.id as string,
    specialExams,
  };
}

export const unitPath = (courseId: string, sequenceId: string, unitId?: string) => (
  `/learning/course/${courseId}/${sequenceId}${unitId ? `/${unitId}` : ''}`
);

interface RenderInCoursewareOptions {
  courseId: string;
  sequenceId: string;
  unitId?: string;
  isPreview?: boolean;
  // The state each query must be in before `ui` renders; by default the two TabPage waits for have succeeded.
  states?: ComponentProps<typeof CourseQueryGate>['states'];
}

/*
 * Renders a courseware component on its own, under the params CoursewareContainer provides and at a unit's route,
 * with the queries CoursewareContainer mounts, once they are in `states`.
 */
export const renderInCourseware = (ui: ReactElement, {
  courseId, sequenceId, unitId, isPreview, states,
}: RenderInCoursewareOptions) => render(
  <MemoryRouter initialEntries={[unitPath(courseId, sequenceId || 'no-sequence', unitId)]}>
    <CourseParamsProvider
      courseId={courseId}
      sequenceId={sequenceId || undefined}
      unitId={unitId}
      isPreview={isPreview}
    >
      <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceId || undefined} />
      <CourseQueryGate courseId={courseId} sequenceId={sequenceId || undefined} states={states}>
        {ui}
      </CourseQueryGate>
    </CourseParamsProvider>
  </MemoryRouter>,
);

// The message the unit's iframe posts once its content has a height: the unit has loaded.
export const loadUnit = (height = 300) => {
  window.postMessage({ type: 'plugin.resize', payload: { height } }, '*');
};
