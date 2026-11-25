import {
  getAuthenticatedHttpClient, getSiteConfig, mergeSiteConfig, setSiteConfig,
} from '@openedx/frontend-base';
import '@testing-library/jest-dom';
import {
  act, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { dashboardRole } from '@src/constants';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import routes from '@src/routes';
import { mockLocation } from '@src/tests/location';
import { renderBrowserRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { sequenceNavigationSlotOperation } from '@src/widgets/SequenceNavigation';
import tabMessages from '../tab-page/messages';

import { getSequenceForUnitDeprecatedUrl } from './data/api';
import { coursewareMetadataQuery, minimalCourseOutlineQuery } from './data/apiHooks';
import { buildSimpleCourseBlocks, buildBinaryCourseBlocks } from '../shared/data/__factories__/courseBlocks.factory';
import { appendBrowserTimezoneToUrl } from '../utils';
import { buildOutlineFromBlocks } from './data/__factories__/learningSequencesOutline.factory';

// NOTE: Because the unit creates an iframe, we choose to mock it out as its rendering isn't
// pertinent to this test.  Instead, we render a simple div that displays the properties we expect
// to have been passed into the component.  Separate tests can handle unit rendering, but this
// proves that the component is rendered and receives the correct props.  We probably COULD render
// Unit.jsx and its iframe in this test, but it's already complex enough.

let mockRenderUnitNav = false;
jest.mock(
  './course/sequence/Unit',
  // eslint-disable-next-line react/prop-types
  () => function Unit({ courseId, id, renderUnitNavigation }) {
    return (
      <div className="fake-unit">
        Unit Contents {courseId} {id}
        {mockRenderUnitNav && renderUnitNavigation ? renderUnitNavigation() : null}
      </div>
    );
  },
);

// The legacy app's test client turns retries off for every query; here each query carries the policy itself, so the suite turns it off there.
jest.mock('@src/queryClient', () => {
  const actual = jest.requireActual('@src/queryClient');
  return { ...actual, queryDefaults: { ...actual.queryDefaults, retry: false } };
});

// The legacy app pushes onto frontend-platform's history; here the push goes to the browser's, which the router reads when it is created.
const history = {
  push: (path) => {
    window.history.pushState({}, '', `/learning${path}`);
  },
};

describe('CoursewareContainer', () => {
  let axiosMock;
  let queryClient;
  let router;
  let pathnames;

  // This is a standard set of data that can be used in CoursewareContainer tests.
  // By default, `setUpMockRequests()` will configure the mock LMS API to return use this data.
  // Certain test cases override these in order to test with special blocks/metadata.
  const defaultCourseMetadata = Factory.build('courseMetadata');
  const defaultCourseHomeMetadata = Factory.build('courseHomeMetadata');
  const defaultCourseId = defaultCourseMetadata.id;
  const defaultUnitBlocks = [
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: defaultCourseId },
    ),
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: defaultCourseId },
    ),
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: defaultCourseId },
    ),
  ];
  const {
    courseBlocks: defaultCourseBlocks,
    sequenceBlocks: [defaultSequenceBlock],
    sectionBlocks: [defaultSectionBlock],
  } = buildSimpleCourseBlocks(
    defaultCourseId,
    defaultCourseHomeMetadata.title,
    { unitBlocks: defaultUnitBlocks },
  );

  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('.')]));

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    // A redirect to the course home renders the outline tab, which asks for its own data.
    axiosMock.onGet(new RegExp(`${getSiteConfig().lmsBaseUrl}/api/course_home/outline/*`)).reply(200, Factory.build('outlineTabData'));
  });

  afterEach(() => {
    mockRenderUnitNav = false;
    router.dispose();
  });

  function setUpMockRequests(options = {}) {
    // If we weren't given course blocks or metadata, use the defaults.
    const courseBlocks = options.courseBlocks || defaultCourseBlocks;
    const courseOutline = buildOutlineFromBlocks(courseBlocks);
    const courseMetadata = options.courseMetadata || defaultCourseMetadata;
    const courseHomeMetadata = options.courseHomeMetadata || defaultCourseHomeMetadata;
    const courseId = courseMetadata.id;
    // If we weren't given a list of sequence metadatas for URL mocking,
    // then construct it ourselves by looking at courseBlocks.
    const sequenceMetadatas = options.sequenceMetadatas || (
      Object.values(courseBlocks.blocks)
        .filter(block => block.type === 'sequential')
        .map(sequenceBlock => Factory.build(
          'sequenceMetadata',
          {},
          {
            courseId,
            sequenceBlock,
            unitBlocks: sequenceBlock.children.map(unitId => courseBlocks.blocks[unitId]),
          },
        ))
    );

    const learningSequencesUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`);
    axiosMock.onGet(learningSequencesUrlRegExp).reply(200, courseOutline);

    const courseMetadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);

    const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);

    sequenceMetadatas.forEach(sequenceMetadata => {
      const sequenceMetadataUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceMetadata.item_id}`;
      axiosMock.onGet(sequenceMetadataUrl).reply(200, sequenceMetadata);
      const proctoredExamApiUrl = `${getSiteConfig().lmsBaseUrl}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${courseId}/content_id/${sequenceMetadata.item_id}?is_learning_mfe=true`;
      axiosMock.onGet(proctoredExamApiUrl).reply(200, { exam: {}, active_attempt: {} });
    });

    // Set up handlers for noticing when units are in the sequence spot
    const courseBlocksUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/courses/v2/blocks/*`);
    axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
    Object.values(courseBlocks.blocks)
      .filter(block => block.type === 'vertical')
      .forEach(unitBlock => {
        const sequenceMetadataUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${unitBlock.id}`;
        axiosMock.onGet(sequenceMetadataUrl).reply(422, {});
      });

    const discussionConfigUrl = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/discussion/v1/courses/*`);
    axiosMock.onGet(discussionConfigUrl).reply(200, { provider: 'legacy' });

    // The outline sidebar (rendered via its trigger) fetches these at render.
    const navigationUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/course_home/v1/navigation/*`);
    axiosMock.onGet(navigationUrlRegExp).reply(200, courseBlocks);
    const sidebarTogglesUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/courses/.*/courseware-navigation-sidebar/toggles/`);
    axiosMock.onGet(sidebarTogglesUrlRegExp).reply(200, { enable_completion_tracking: true });
  }

  // Renders the route array at the browser's address, and records every pathname the router is at from then on.
  function renderRouteArray(tree = routes) {
    const rendered = renderBrowserRoutes(tree);
    ({ queryClient, router } = rendered);
    pathnames = [router.state.location.pathname];
    router.subscribe(({ location }) => {
      if (location.pathname !== pathnames.at(-1)) {
        pathnames.push(location.pathname);
      }
    });
    return rendered;
  }

  async function loadContainer(tree) {
    const { container } = renderRouteArray(tree);
    // Wait for the page spinner to be removed, such that we can wait for our main
    // content to load before making any assertions.
    await screen.findByRole('status');
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    return container;
  }

  it('should initialize to show a spinner', async () => {
    history.push('/course/abc123');
    renderRouteArray();

    const spinner = await screen.findByRole('status');

    expect(spinner.firstChild).toContainHTML(
      `<span class="sr-only">${tabMessages.loading.defaultMessage}</span>`,
    );
  });

  describe('when receiving successful course data', () => {
    // const courseMetadata = defaultCourseMetadata;
    const courseHomeMetadata = defaultCourseHomeMetadata;
    const courseId = defaultCourseId;

    // The legacy app asserts on the header, which the shell renders here, so this reads the query cache instead.
    async function assertMetadataAndOutlineLoaded() {
      await waitFor(() => {
        // Both metadata requests have succeeded - this proves we loaded course metadata properly.
        expect(queryClient.getQueryState(courseHomeMetaQuery(courseId).queryKey)?.status).toBe('success');
        expect(queryClient.getQueryState(coursewareMetadataQuery(courseId).queryKey)?.status).toBe('success');
        // The outline request has succeeded.  This means we loaded course blocks properly.
        expect(queryClient.getQueryState(minimalCourseOutlineQuery(courseId).queryKey)?.status).toBe('success');
      });
    }

    function assertNoSequenceNavigation(container) {
      const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation a, nav.sequence-navigation button');
      expect(sequenceNavButtons).toHaveLength(0);

      container.querySelectorAll('button, a').forEach((control) => {
        expect(control).not.toHaveTextContent('Previous');
        expect(control).not.toHaveTextContent('Next');
      });
      expect(container.querySelector('svg.fa-tasks')).toBeNull();
    }

    beforeEach(async () => {
      // On page load, SequenceContext attempts to scroll to the top of the page.
      global.scrollTo = jest.fn();
      setUpMockRequests();
    });

    describe('when the URL only contains a course ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should use the resume block response to pick a unit if it contains one', async () => {
        axiosMock.onGet(`${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`).reply(200, {
          sectionId: sequenceBlock.id,
          unitId: unitBlocks[1].id,
        });

        history.push(`/course/${courseId}`);
        const container = await loadContainer();

        await assertMetadataAndOutlineLoaded();
        assertNoSequenceNavigation(container);

        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents'));
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[1].id);
      });

      it('should use the first sequence ID and activeUnitIndex if the resume block response is empty', async () => {
        // set the position to the third unit so we can prove activeUnitIndex is working
        const sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { position: 3 }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );
        setUpMockRequests({ sequenceMetadatas: [sequenceMetadata] });

        // Note how there is no sectionId/unitId returned in this mock response!
        axiosMock.onGet(`${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`).reply(200, {});

        history.push(`/course/${courseId}`);
        const container = await loadContainer();

        await assertMetadataAndOutlineLoaded();
        assertNoSequenceNavigation(container);

        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents'));
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });

      it('should ask for the resume block again on a later visit to the course root', async () => {
        const resumeUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`;
        const resumeRequests = () => axiosMock.history.get.filter((req) => req.url === resumeUrl);
        axiosMock.onGet(resumeUrl).reply(200, { sectionId: sequenceBlock.id, unitId: unitBlocks[0].id });

        history.push(`/course/${courseId}`);
        // An in-app link back to the course root, as the fallbacks to it navigate.
        const withLink = [{
          element: (
            <>
              <Link to={`/learning/course/${courseId}`}>course root</Link>
              <Outlet />
            </>
          ),
          children: routes,
        }];
        const container = await loadContainer(withLink);
        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[0].id));
        expect(resumeRequests()).toHaveLength(1);

        // The learner has moved on since; the next visit to the root must not reuse the first answer.
        axiosMock.onGet(resumeUrl).reply(200, { sectionId: sequenceBlock.id, unitId: unitBlocks[2].id });
        const user = userEvent.setup();
        await user.click(screen.getByRole('link', { name: 'course root' }));

        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id));
        expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/${sequenceBlock.id}/${unitBlocks[2].id}`);
        expect(resumeRequests()).toHaveLength(2);
      });

      it('should stay on the course root when the resume block request fails', async () => {
        const resumeUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`;
        axiosMock.onGet(resumeUrl).reply(500);

        history.push(`/course/${courseId}`);
        const container = await loadContainer();

        await assertMetadataAndOutlineLoaded();
        await waitFor(() => expect(axiosMock.history.get.filter((req) => req.url === resumeUrl)).toHaveLength(1));
        expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`);
        expect(container.querySelector('.fake-unit')).toBeNull();
      });
    });

    describe('when the URL contains a unit ID instead of a sequence ID', () => {
      const { href: blocksUrl } = getSequenceForUnitDeprecatedUrl(courseId);
      const courseBlocksUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/courses/v2/blocks/*`);
      const unitBlock = defaultUnitBlocks[1];
      const savedBlocksRequests = () => axiosMock.history.get.filter((req) => req.url === blocksUrl);

      it('should redirect to the unit within its parent sequence', async () => {
        history.push(`/course/${courseId}/${unitBlock.id}`);
        const container = await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(
          `http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}/${unitBlock.id}`,
        ));
        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlock.id));
        expect(savedBlocksRequests()).toHaveLength(1);
      });

      it('should redirect to the course root when no sequence holds the unit', async () => {
        axiosMock.onGet(courseBlocksUrlRegExp).reply(200, {
          ...defaultCourseBlocks,
          blocks: {
            ...defaultCourseBlocks.blocks,
            [defaultSequenceBlock.id]: { ...defaultSequenceBlock, children: [] },
          },
        });

        history.push(`/course/${courseId}/${unitBlock.id}`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`));
        expect(savedBlocksRequests()).toHaveLength(1);
      });

      it('should redirect to the course root when the blocks request fails', async () => {
        axiosMock.onGet(courseBlocksUrlRegExp).reply(500);

        history.push(`/course/${courseId}/${unitBlock.id}`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`));
        expect(savedBlocksRequests()).toHaveLength(1);
      });
    });

    describe('when the URL has the /preview prefix', () => {
      const unitPath = `/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`;

      it('should send a user who is not staff to the same URL without the prefix', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        history.push(`/preview${unitPath}`);
        const container = await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning${unitPath}`));
        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent(defaultUnitBlocks[0].id));
        expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('You should call navigate() in a React.useEffect()'));
        warn.mockRestore();
      });

      it('should keep staff on the preview URL', async () => {
        setUpMockRequests({ courseHomeMetadata: Factory.build('courseHomeMetadata', { original_user_is_staff: true }) });

        history.push(`/preview${unitPath}`);
        const container = await loadContainer();

        expect(container.querySelector('.fake-unit')).toHaveTextContent(defaultUnitBlocks[0].id);
        expect(global.location.href).toEqual(`http://localhost/learning/preview${unitPath}`);
      });

      it('should send a user who is not staff from a unit ID in the sequence slot to the unit without the prefix', async () => {
        const unitBlock = defaultUnitBlocks[1];
        const { href: blocksUrl } = getSequenceForUnitDeprecatedUrl(courseId);

        history.push(`/preview/course/${courseId}/${unitBlock.id}`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(
          `http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}/${unitBlock.id}`,
        ));
        expect(axiosMock.history.get.filter((req) => req.url === blocksUrl)).toHaveLength(1);
      });

      it('should keep the prefix when redirecting staff from a section to its first sequence', async () => {
        setUpMockRequests({ courseHomeMetadata: Factory.build('courseHomeMetadata', { original_user_is_staff: true }) });

        history.push(`/preview/course/${courseId}/${defaultSectionBlock.id}`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/preview${unitPath}`));
      });

      it('should drop the prefix when redirecting staff to the course root', async () => {
        setUpMockRequests({ courseHomeMetadata: Factory.build('courseHomeMetadata', { original_user_is_staff: true }) });

        history.push(`/preview/course/${courseId}/block-v1:edX+DemoX+Demo_Course+type@sequential+block@unknown`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`));
      });
    });

    describe('when the URL contains a section ID instead of a sequence ID', () => {
      const {
        courseBlocks, unitTree, sequenceTree, sectionTree,
      } = buildBinaryCourseBlocks(courseId, courseHomeMetadata.title);

      function setUrl(urlSequenceId, urlUnitId = null) {
        history.push(`/course/${courseId}/${urlSequenceId}/${urlUnitId || ''}`);
      }

      function assertLocation(container, sequenceId, unitId) {
        const expectedUrl = `http://localhost/learning/course/${courseId}/${sequenceId}/${unitId}`;
        expect(global.location.href).toEqual(expectedUrl);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitId);
      }

      beforeEach(async () => {
        setUpMockRequests({ courseBlocks });
      });

      describe('when the URL does not contain a unit ID', () => {
        it('should choose a unit within the section\'s first sequence', async () => {
          setUrl(sectionTree[1].id);
          const container = await loadContainer();
          await assertMetadataAndOutlineLoaded();
          assertNoSequenceNavigation(container);
          // Two redirects, the second after the sequence request comes back.
          await waitFor(() => assertLocation(container, sequenceTree[1][0].id, unitTree[1][0][0].id));
        });
      });

      describe('when the section is empty', () => {
        // Make a (shallow-)copy of the course blocks.
        // Remove all descendents of the second section.
        const blocksWithEmptySection = { ...courseBlocks.blocks };
        blocksWithEmptySection[sectionTree[1].id] = {
          ...sectionTree[1],
          children: [],
        };
        sequenceTree[1].forEach(sequence => {
          delete blocksWithEmptySection[sequence.id];
        });
        unitTree[1].flat().forEach(unit => {
          delete blocksWithEmptySection[unit.id];
        });
        const courseBlocksWithEmptySection = {
          ...courseBlocks,
          blocks: blocksWithEmptySection,
        };

        beforeEach(async () => {
          setUpMockRequests({ courseBlocks: courseBlocksWithEmptySection });
        });

        it('should ignore the section ID and instead redirect to the course root', async () => {
          setUrl(sectionTree[1].id);
          await loadContainer();
          expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`);
        });
      });

      describe('when next leaves the first section', () => {
        const celebrationKey = 'CelebrationModal.showOnSectionLoad';

        beforeEach(() => {
          global.localStorage.removeItem(celebrationKey);
          setUpMockRequests({
            courseBlocks,
            courseMetadata: Factory.build('courseMetadata', { celebrations: { first_section: true } }),
          });
        });

        it('records the section change for the first-section celebration', async () => {
          mockRenderUnitNav = true;
          setUrl(sequenceTree[0][1].id, unitTree[0][1][1].id);
          await loadContainer();

          const user = userEvent.setup();
          await user.click(screen.getByRole('link', { name: /next/i }));

          expect(JSON.parse(global.localStorage.getItem(celebrationKey))).toEqual({
            prevSequenceId: sequenceTree[0][1].id,
            nextSequenceId: sequenceTree[1][0].id,
          });
        });
      });
    });

    describe('when the URL contains a section ID and a unit ID', () => {
      it('should redirect to the unit within its parent sequence', async () => {
        const unitBlock = defaultUnitBlocks[1];
        history.push(`/course/${courseId}/${defaultSectionBlock.id}/${unitBlock.id}`);
        const container = await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(
          `http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}/${unitBlock.id}`,
        ));
        await waitFor(() => expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlock.id));
      });
    });

    describe('when the URL contains an ID that is not a sequence, section or unit', () => {
      it('should redirect to the course root', async () => {
        history.push(`/course/${courseId}/block-v1:edX+DemoX+Demo_Course+type@sequential+block@unknown`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`));
        expect(axiosMock.history.get.map(({ url }) => url)).not.toContainEqual(expect.stringContaining('/api/courses/v2/blocks/'));
      });

      it('should stay put when a unit ID follows it', async () => {
        const path = `/course/${courseId}/block-v1:edX+DemoX+Demo_Course+type@sequential+block@unknown/${defaultUnitBlocks[0].id}`;
        history.push(path);
        await loadContainer();

        expect(global.location.href).toEqual(`http://localhost/learning${path}`);
      });
    });

    describe('when the sequence has no units', () => {
      beforeEach(() => {
        const sequenceMetadata = Factory.build(
          'sequenceMetadata',
          {},
          { courseId, sequenceBlock: defaultSequenceBlock, unitBlocks: [] },
        );
        setUpMockRequests({ sequenceMetadatas: [sequenceMetadata] });
      });

      it('should redirect a unit marker to the sequence', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}/first`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}`));
      });

      it('should stay on the sequence without a redirect to it', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}`);
        const replaceState = jest.spyOn(global.history, 'replaceState');
        await loadContainer();
        await waitFor(() => expect(queryClient.isFetching()).toBe(0));

        expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}`);
        // React Router stamps the initial entry with replaceState(state, '') on start-up; a redirect
        // passes a URL.
        expect(replaceState.mock.calls.filter(([, , url]) => url)).toHaveLength(0);
        replaceState.mockRestore();
      });
    });

    describe('when the learning-sequences outline fails', () => {
      const learningSequencesUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`);

      beforeEach(() => {
        axiosMock.onGet(learningSequencesUrlRegExp).reply(500);
      });

      it('should go to the course home', async () => {
        history.push(`/course/${courseId}`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/home`));
      });

      it('should go to the course home rather than the sequence\'s unit', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}`);
        await loadContainer();

        await waitFor(() => expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/home`));
      });
    });

    describe('when the URL contains a unit marker', () => {
      it('should redirect /first to the first unit', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}/first`);
        await loadContainer();
        expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      });

      it('should redirect /last to the last unit', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}/last`);
        await loadContainer();
        expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[2].id}`);
      });
    });

    describe('when the URL contains a course ID and sequence ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should pick the first unit if position was not defined (activeUnitIndex becomes 0)', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const container = await loadContainer();

        await assertMetadataAndOutlineLoaded();
        assertNoSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[0].id);
      });

      it('should use activeUnitIndex to pick a unit from the sequence', async () => {
        const sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { position: 3 }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );
        setUpMockRequests({ sequenceMetadatas: [sequenceMetadata] });

        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const container = await loadContainer();

        await assertMetadataAndOutlineLoaded();
        assertNoSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });

    describe('when the URL contains a course, sequence, and unit ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should load the specified unit', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[2].id}`);
        const container = await loadContainer();

        await assertMetadataAndOutlineLoaded();
        assertNoSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });

      it('renders the unit tab strip a site adds to the sequence navigation slot', async () => {
        addSlotOperations([sequenceNavigationSlotOperation]);

        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[0].id}`);
        await loadContainer();

        const tabStrip = await screen.findByTestId('courseware-sequence-navigation');
        expect(within(tabStrip).getByRole('link', { name: unitBlocks[1].display_name })).toBeInTheDocument();
      });

      it('marks the current unit complete when navigating to the next unit', async () => {
        const completionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${sequenceBlock.id}/handler/get_completion`;
        axiosMock.onPost(completionUrl).reply(200, { complete: true });

        mockRenderUnitNav = true;
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[0].id}`);
        await loadContainer();

        const user = userEvent.setup();
        await user.click(screen.getByRole('link', { name: /next/i }));

        await waitFor(() => {
          expect(axiosMock.history.post.filter(request => request.url === completionUrl)).toHaveLength(1);
        });
      });

      it('saves the position on each unit change', async () => {
        const positionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${sequenceBlock.id}/handler/goto_position`;
        axiosMock.onPost(positionUrl).reply(200, {});
        const savedPositions = () => axiosMock.history.post
          .filter(request => request.url === positionUrl)
          .map(request => JSON.parse(request.data).position);

        mockRenderUnitNav = true;
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[0].id}`);
        const container = await loadContainer();
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[0].id);
        expect(savedPositions()).toEqual([]);

        const user = userEvent.setup();
        await user.click(screen.getByRole('link', { name: /next/i }));
        await waitFor(() => expect(savedPositions()).toEqual([2]));
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[1].id);

        await user.click(screen.getByRole('link', { name: /next/i }));
        await waitFor(() => expect(savedPositions()).toEqual([2, 3]));
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });
  });

  describe('when the course has no sections', () => {
    it('does not resume-redirect (there is no first sequence to pick)', async () => {
      global.scrollTo = jest.fn();
      const courseId = defaultCourseId;
      const emptyCourseBlocks = {
        courseId,
        title: defaultCourseHomeMetadata.title,
        blocks: {
          [courseId]: {
            id: courseId,
            type: 'course',
            display_name: defaultCourseHomeMetadata.title,
            children: [],
          },
        },
        root: courseId,
      };
      setUpMockRequests({ courseBlocks: emptyCourseBlocks });
      axiosMock.onGet(`${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`).reply(200, {});

      history.push(`/course/${courseId}`);
      const container = await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/learning/course/${courseId}`);
      expect(container.querySelector('.fake-unit')).toBeNull();
    });
  });

  describe('when receiving a course_access error_code', () => {
    function setUpWithDeniedStatus(errorCode) {
      const courseMetadata = Factory.build('courseMetadata');
      const courseHomeMetadata = Factory.build('courseHomeMetadata', {
        course_access: {
          has_access: false,
          error_code: errorCode,
          additional_context_user_message: 'uhoh oh no', // only used by audit_expired
          developer_message: '/data_sharing_consent_url', // only used by data_sharing_access_required
        },
      });

      const courseId = courseMetadata.id;

      const { courseBlocks, sequenceBlocks, unitBlocks } = buildSimpleCourseBlocks(courseId, courseMetadata.name);
      setUpMockRequests({ courseBlocks, courseMetadata, courseHomeMetadata });
      history.push(`/course/${courseId}/${sequenceBlocks[0].id}/${unitBlocks[0].id}`);
      return { courseMetadata, unitBlocks };
    }

    it('should go to course home for an enrollment_required error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('enrollment_required');
      await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/learning/course/${courseMetadata.id}/home`);
    });

    // The redirect route's loaders send these on from /redirect/...: a dashboard denial to the site's dashboard role.
    const siteConfig = getSiteConfig();
    const dashboardUrl = 'http://localhost:18000/dashboard';
    const declareDashboard = () => mergeSiteConfig({ externalRoutes: [{ role: dashboardRole, url: dashboardUrl }] });

    afterEach(() => {
      act(() => setSiteConfig(siteConfig));
    });

    it('should go to course survey for a survey_required error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('survey_required');
      const { replace } = mockLocation({ replace: jest.fn() });
      await loadContainer();

      await waitFor(() => expect(replace).toHaveBeenCalledWith(`${getSiteConfig().lmsBaseUrl}/courses/${courseMetadata.id}/survey`));
    });

    it('should go to consent page for a data_sharing_access_required error code', async () => {
      setUpWithDeniedStatus('data_sharing_access_required');
      const { replace } = mockLocation({ replace: jest.fn() });
      await loadContainer();

      await waitFor(() => expect(replace).toHaveBeenCalledWith(`${getSiteConfig().lmsBaseUrl}/data_sharing_consent_url`));
    });

    it('should go to access denied page for a incorrect_active_enterprise error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('incorrect_active_enterprise');
      await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/learning/course/${courseMetadata.id}/access-denied`);
      // The access-denied page loads its alert lazily: wait for it, or it can finish loading after the test has ended.
      await screen.findByRole('alert');
    });

    it('should go to course home for an authentication_required error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('authentication_required');
      await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/learning/course/${courseMetadata.id}/home`);
    });

    it('should go to dashboard for an unfulfilled_milestones error code', async () => {
      declareDashboard();
      setUpWithDeniedStatus('unfulfilled_milestones');
      const { replace } = mockLocation({ replace: jest.fn() });
      await loadContainer();

      await waitFor(() => expect(replace).toHaveBeenCalledWith(dashboardUrl));
    });

    it('should go to the dashboard, with no query, for an audit_expired error code', async () => {
      declareDashboard();
      setUpWithDeniedStatus('audit_expired');
      const { replace } = mockLocation({ replace: jest.fn() });
      await loadContainer();

      await waitFor(() => expect(replace).toHaveBeenCalledWith(dashboardUrl));
    });

    it('should go to the dashboard, with no query, for a course_not_started error code', async () => {
      declareDashboard();
      setUpWithDeniedStatus('course_not_started');
      const { replace } = mockLocation({ replace: jest.fn() });
      await loadContainer();

      await waitFor(() => expect(replace).toHaveBeenCalledWith(dashboardUrl));
    });

    it('should go to the dashboard for a course_not_started_enterprise_learner error code with no enterprise portal configured', async () => {
      declareDashboard();
      setUpWithDeniedStatus('course_not_started_enterprise_learner');
      const { replace } = mockLocation({ replace: jest.fn() });
      await loadContainer();

      await waitFor(() => expect(replace).toHaveBeenCalledWith(dashboardUrl));
    });
  });

  describe('while the learning-sequences outline is pending', () => {
    const learningSequencesUrlRegExp = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`);
    const unitPath = `/course/${defaultCourseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[1].id}`;

    // Holds the outline request, as a slow outline would.
    const holdOutline = () => {
      axiosMock.onGet(learningSequencesUrlRegExp).reply(() => new Promise(() => {}));
    };

    // Both metadata queries have succeeded, and the page has had a render with the outline still held.
    const waitForMetadataWithOutlinePending = async () => {
      await waitFor(() => {
        expect(queryClient.getQueryState(coursewareMetadataQuery(defaultCourseId).queryKey)?.status).toBe('success');
        expect(queryClient.getQueryState(courseHomeMetaQuery(defaultCourseId).queryKey)?.status).toBe('success');
      });
      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });
    };

    const renderUnit = () => {
      history.push(unitPath);
      renderRouteArray();
    };

    beforeEach(() => {
      setUpMockRequests();
    });

    it('disables the Next control', async () => {
      mockRenderUnitNav = true;
      holdOutline();
      renderUnit();
      await waitForMetadataWithOutlinePending();

      expect(screen.getByText(/^next$/i).closest('a, button')).toBeDisabled();
    });

    it('does not show a page title with an empty segment', async () => {
      holdOutline();
      renderUnit();
      await waitForMetadataWithOutlinePending();

      expect(document.title).not.toMatch(/^\s*\||\|\s*\|/);
    });

    it('does not resume-redirect from the course root', async () => {
      const resumeUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${defaultCourseId}`;
      axiosMock.onGet(resumeUrl).reply(200, { sectionId: defaultSectionBlock.id, unitId: defaultUnitBlocks[1].id });
      holdOutline();
      history.push(`/course/${defaultCourseId}`);
      renderRouteArray();
      await waitForMetadataWithOutlinePending();

      expect(global.location.href).toEqual(`http://localhost/learning/course/${defaultCourseId}`);
      expect(axiosMock.history.get.map(({ url }) => url)).not.toContain(resumeUrl);
    });

    it('does not redirect a section URL', async () => {
      holdOutline();
      history.push(`/course/${defaultCourseId}/${defaultSectionBlock.id}`);
      renderRouteArray();
      await waitForMetadataWithOutlinePending();

      expect(global.location.href).toEqual(`http://localhost/learning/course/${defaultCourseId}/${defaultSectionBlock.id}`);
      expect(axiosMock.history.get.map(({ url }) => url)).not.toContainEqual(expect.stringContaining('/api/courses/v2/blocks/'));
    });
  });

  describe('request count', () => {
    it('requests the course metadata once per load', async () => {
      setUpMockRequests();
      history.push(`/course/${defaultCourseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      await loadContainer();
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));

      const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${defaultCourseId}`);
      expect(axiosMock.history.get.filter((req) => req.url === courseHomeMetadataUrl)).toHaveLength(1);
    });

    it('requests the sequence metadata once per load', async () => {
      setUpMockRequests();
      history.push(`/course/${defaultCourseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      await loadContainer();
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));

      const sequenceMetadataUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${defaultSequenceBlock.id}`;
      expect(axiosMock.history.get.filter((req) => req.url === sequenceMetadataUrl)).toHaveLength(1);
    });

    it('requests the courseware metadata once per load', async () => {
      setUpMockRequests();
      history.push(`/course/${defaultCourseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      await loadContainer();
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));

      const coursewareMetadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/${defaultCourseId}`);
      expect(axiosMock.history.get.filter((req) => req.url === coursewareMetadataUrl)).toHaveLength(1);
    });

    it('requests the learning-sequences outline once per load', async () => {
      setUpMockRequests();
      history.push(`/course/${defaultCourseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      await loadContainer();
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));

      const outlineUrl = new URL(`${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/${defaultCourseId}`).href;
      expect(axiosMock.history.get.filter((req) => req.url === outlineUrl)).toHaveLength(1);
    });
  });

  describe('the position save', () => {
    const courseId = defaultCourseId;
    const positionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${defaultSequenceBlock.id}/handler/goto_position`;
    const unitPath = (unitBlock) => `/learning/course/${courseId}/${defaultSequenceBlock.id}/${unitBlock.id}`;
    const savedPositions = () => axiosMock.history.post
      .filter(request => request.url === positionUrl)
      .map(request => JSON.parse(request.data).position);
    // In-app links to move between pages, as the real course component's navigation does.
    const withLinks = [{
      element: (
        <>
          <Link to={unitPath(defaultUnitBlocks[1])}>second unit</Link>
          <Link to={unitPath(defaultUnitBlocks[2])}>third unit</Link>
          <Link to={`/learning/course/${courseId}/home`}>course home</Link>
          <Outlet />
        </>
      ),
      children: routes,
    }];

    beforeEach(() => {
      setUpMockRequests();
      axiosMock.onPost(positionUrl).reply(200, {});
    });

    it('saves nothing on opening a unit, then the position on each move to another unit', async () => {
      history.push(`/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      const container = await loadContainer(withLinks);
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));
      expect(container.querySelector('.fake-unit')).toHaveTextContent(defaultUnitBlocks[0].id);
      expect(savedPositions()).toEqual([]);

      const user = userEvent.setup();
      await user.click(screen.getByRole('link', { name: 'second unit' }));
      await waitFor(() => expect(savedPositions()).toEqual([2]));
      expect(container.querySelector('.fake-unit')).toHaveTextContent(defaultUnitBlocks[1].id);

      await user.click(screen.getByRole('link', { name: 'third unit' }));
      await waitFor(() => expect(savedPositions()).toEqual([2, 3]));
      expect(container.querySelector('.fake-unit')).toHaveTextContent(defaultUnitBlocks[2].id);
    });

    it('saves the position on coming back to a unit of a sequence that is still loaded', async () => {
      history.push(`/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      await loadContainer(withLinks);
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));
      expect(savedPositions()).toEqual([]);

      // Another tab unmounts the container; the sequence stays in the query cache.
      const user = userEvent.setup();
      await user.click(screen.getByRole('link', { name: 'course home' }));
      // The course home shows a not-enrolled learner an alert it loads lazily: wait for it before leaving.
      await screen.findByTestId('private-course-alert');
      await user.click(screen.getByRole('link', { name: 'second unit' }));

      await waitFor(() => expect(savedPositions()).toEqual([2]));
    });
  });

  describe('the addresses a redirect passes through', () => {
    const courseId = defaultCourseId;
    const coursePath = `/learning/course/${courseId}`;
    const sequencePath = `${coursePath}/${defaultSequenceBlock.id}`;
    const resumeUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`;
    const unknownId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@unknown';
    const staff = Factory.build('courseHomeMetadata', { original_user_is_staff: true });

    // Waits for the last address, then gives every address from the first.
    const pathnamesUpTo = async (lastPathname) => {
      await waitFor(() => expect(router.state.location.pathname).toEqual(lastPathname));
      return pathnames;
    };

    beforeEach(() => {
      setUpMockRequests();
      // The course root's own redirect, for the forms that fall back to the root.
      axiosMock.onGet(resumeUrl).reply(200, { sectionId: defaultSequenceBlock.id, unitId: defaultUnitBlocks[1].id });
    });

    it('from the course root with no resume position: the first sequence, then its active unit', async () => {
      axiosMock.onGet(resumeUrl).reply(200, {});
      history.push(`/course/${courseId}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${sequencePath}/${defaultUnitBlocks[0].id}`)).toEqual([
        coursePath,
        sequencePath,
        `${sequencePath}/${defaultUnitBlocks[0].id}`,
      ]);
    });

    it('from a section: its first sequence, then that sequence\'s active unit', async () => {
      history.push(`/course/${courseId}/${defaultSectionBlock.id}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${sequencePath}/${defaultUnitBlocks[0].id}`)).toEqual([
        `${coursePath}/${defaultSectionBlock.id}`,
        sequencePath,
        `${sequencePath}/${defaultUnitBlocks[0].id}`,
      ]);
    });

    it('from a section and a unit: the unit alone, then the unit under its parent sequence', async () => {
      const unitId = defaultUnitBlocks[2].id;
      history.push(`/course/${courseId}/${defaultSectionBlock.id}/${unitId}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${sequencePath}/${unitId}`)).toEqual([
        `${coursePath}/${defaultSectionBlock.id}/${unitId}`,
        `${coursePath}/${unitId}`,
        `${sequencePath}/${unitId}`,
      ]);
    });

    it('from a unit no sequence holds: the course root, then the resume position', async () => {
      const unitId = defaultUnitBlocks[2].id;
      axiosMock.onGet(new RegExp(`${getSiteConfig().lmsBaseUrl}/api/courses/v2/blocks/*`)).reply(200, {
        ...defaultCourseBlocks,
        blocks: {
          ...defaultCourseBlocks.blocks,
          [defaultSequenceBlock.id]: { ...defaultSequenceBlock, children: [] },
        },
      });
      history.push(`/course/${courseId}/${unitId}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${sequencePath}/${defaultUnitBlocks[1].id}`)).toEqual([
        `${coursePath}/${unitId}`,
        coursePath,
        `${sequencePath}/${defaultUnitBlocks[1].id}`,
      ]);
    });

    it('from an ID that is not a sequence, section or unit: the course root, then the resume position', async () => {
      history.push(`/course/${courseId}/${unknownId}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${sequencePath}/${defaultUnitBlocks[1].id}`)).toEqual([
        `${coursePath}/${unknownId}`,
        coursePath,
        `${sequencePath}/${defaultUnitBlocks[1].id}`,
      ]);
    });

    it('from a preview sequence as a user who is not staff: the sequence without the prefix, then its active unit', async () => {
      history.push(`/preview/course/${courseId}/${defaultSequenceBlock.id}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${sequencePath}/${defaultUnitBlocks[0].id}`)).toEqual([
        `/learning/preview/course/${courseId}/${defaultSequenceBlock.id}`,
        sequencePath,
        `${sequencePath}/${defaultUnitBlocks[0].id}`,
      ]);
    });

    it('from a preview section as staff: each address under the prefix', async () => {
      setUpMockRequests({ courseHomeMetadata: staff });
      const previewPath = `/learning/preview/course/${courseId}`;
      history.push(`/preview/course/${courseId}/${defaultSectionBlock.id}`);
      await loadContainer();

      expect(await pathnamesUpTo(`${previewPath}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`)).toEqual([
        `${previewPath}/${defaultSectionBlock.id}`,
        `${previewPath}/${defaultSequenceBlock.id}`,
        `${previewPath}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`,
      ]);
    });
  });
});
