import { getConfig, setConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Factory } from 'rosie';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { courseHomeQueryKeys } from '@src/course-home/data/queryKeys';
import CourseBreadcrumbs from '@src/courseware/course/breadcrumbs';
import { buildOutlineFromBlocks } from '@src/courseware/data/__factories__/learningSequencesOutline.factory';
import { useCoursewareMetadata, useMinimalCourseOutline } from '@src/courseware/data/apiHooks';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import { createTestQueryClient, initializeMockApp } from '@src/setupTest';
import { buildSimpleCourseBlocks } from '@src/shared/data/__factories__/courseBlocks.factory';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import { CourseBreadcrumbsSlot } from './index';

jest.unmock('@openedx/frontend-plugin-framework');

initializeMockApp();

describe('CourseBreadcrumbsSlot', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const courseId = courseMetadata.id;
  const {
    courseBlocks, sectionBlocks: [sectionBlock], sequenceBlocks: [sequenceBlock], unitBlocks,
  } = buildSimpleCourseBlocks(courseId, courseHomeMetadata.title);
  const sequenceMetadata = Factory.build('sequenceMetadata', {}, { courseId, sequenceBlock, unitBlocks });
  const learningSequencesUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/*`);

  let axiosMock: MockAdapter;
  let originalConfig: ReturnType<typeof getConfig>;
  let queryClient: QueryClient;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`))
      .reply(200, courseMetadata);
    axiosMock.onGet(appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`))
      .reply(200, courseHomeMetadata);
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceBlock.id}`).reply(200, sequenceMetadata);
    queryClient = createTestQueryClient();

    // The default breadcrumbs inserted as the slot's README shows.
    originalConfig = getConfig();
    setConfig({
      ...originalConfig,
      pluginSlots: {
        'org.openedx.frontend.learning.course_breadcrumbs.v1': {
          keepDefault: false,
          plugins: [{
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
              id: 'default_breadcrumbs_component',
              priority: 50,
              type: DIRECT_PLUGIN,
              RenderWidget: CourseBreadcrumbs,
            },
          }],
        },
      },
    });
  });

  afterEach(() => {
    setConfig(originalConfig);
  });

  // Holds the outline request, as a slow outline would.
  const holdOutline = () => {
    axiosMock.onGet(learningSequencesUrlRegExp).reply(() => new Promise(() => {}));
  };

  // Renders its children once both metadata queries have succeeded, as the courseware page
  // renders the slot, and, unless `waitForOutline` is false, once the outline has too.
  const LoadedGate = ({ waitForOutline = true, children }: { waitForOutline?: boolean, children: ReactNode }) => {
    const metadataQuery = useCoursewareMetadata(courseId, { enabled: false });
    const courseHomeMetaQuery = useCourseHomeMeta(courseId, { enabled: false });
    const outlineQuery = useMinimalCourseOutline(courseId, { enabled: false });
    const isLoaded = metadataQuery.isSuccess && courseHomeMetaQuery.isSuccess
      && (!waitForOutline || outlineQuery.isSuccess);
    return isLoaded ? <>{children}</> : null;
  };

  const renderSlot = ({ waitForOutline = true }: { waitForOutline?: boolean } = {}) => render(
    <AppProvider wrapWithRouter={false}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <MemoryRouter>
            <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceBlock.id} />
            <LoadedGate waitForOutline={waitForOutline}>
              <CourseBreadcrumbsSlot
                courseId={courseId}
                sectionId={sectionBlock.id}
                sequenceId={sequenceBlock.id}
                unitId={unitBlocks[0].id}
                isStaff={false}
              />
            </LoadedGate>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    </AppProvider>,
  );

  it('renders inserted breadcrumbs', async () => {
    axiosMock.onGet(learningSequencesUrlRegExp).reply(200, buildOutlineFromBlocks(courseBlocks));
    renderSlot();

    expect(await screen.findAllByTestId('breadcrumb-item')).toHaveLength(2);
    expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
  });

  it('inserted breadcrumbs do not error while the outline is loading', async () => {
    holdOutline();
    renderSlot({ waitForOutline: false });
    await waitFor(() => {
      expect(queryClient.getQueryState(coursewareQueryKeys.metadata(courseId))?.status).toBe('success');
      expect(queryClient.getQueryState(courseHomeQueryKeys.metadata(courseId))?.status).toBe('success');
    });
    await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 0); }); });

    expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
  });
});
