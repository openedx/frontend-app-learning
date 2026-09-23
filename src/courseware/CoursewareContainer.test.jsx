import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  BrowserRouter, MemoryRouter, Route, Routes,
} from 'react-router-dom';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { UserMessagesProvider } from '../generic/user-messages';
import { ToastProvider } from '../generic/ToastContext';
import tabMessages from '../tab-page/messages';
import { createTestQueryClient, initializeMockApp, waitFor } from '../setupTest';
import { DECODE_ROUTES } from '../constants';

import CoursewareContainer from './CoursewareContainer';
import { buildSimpleCourseBlocks, buildBinaryCourseBlocks } from '../shared/data/__factories__/courseBlocks.factory';
import initializeStore from '../store';
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
  () => function ({ courseId, id, renderUnitNavigation }) {
    return (
      <div className="fake-unit">
        Unit Contents {courseId} {id}
        {mockRenderUnitNav && renderUnitNavigation ? renderUnitNavigation() : null}
      </div>
    );
  },
);

jest.mock('@edx/frontend-platform/analytics');

initializeMockApp();

describe('CoursewareContainer', () => {
  let store;
  let component;
  let axiosMock;
  let queryClient;

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
  } = buildSimpleCourseBlocks(
    defaultCourseId,
    defaultCourseHomeMetadata.title,
    { unitBlocks: defaultUnitBlocks },
  );

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    store = initializeStore();
    queryClient = createTestQueryClient(store);

    component = (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>
          <UserMessagesProvider>
            <ToastProvider>
              <Routes>
                {DECODE_ROUTES.COURSEWARE.map((route) => (
                  <Route
                    key={route}
                    path={route}
                    element={<CoursewareContainer />}
                  />
                ))}
              </Routes>
            </ToastProvider>
          </UserMessagesProvider>
        </QueryClientProvider>
      </AppProvider>
    );
  });

  afterEach(() => {
    mockRenderUnitNav = false;
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

    const learningSequencesUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/*`);
    axiosMock.onGet(learningSequencesUrlRegExp).reply(200, courseOutline);

    const courseMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);

    const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);

    sequenceMetadatas.forEach(sequenceMetadata => {
      const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;
      axiosMock.onGet(sequenceMetadataUrl).reply(200, sequenceMetadata);
      const proctoredExamApiUrl = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${courseId}/content_id/${sequenceMetadata.item_id}?is_learning_mfe=true`;
      axiosMock.onGet(proctoredExamApiUrl).reply(200, { exam: {}, active_attempt: {} });
    });

    // Set up handlers for noticing when units are in the sequence spot
    const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);
    axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
    Object.values(courseBlocks.blocks)
      .filter(block => block.type === 'vertical')
      .forEach(unitBlock => {
        const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${unitBlock.id}`;
        axiosMock.onGet(sequenceMetadataUrl).reply(422, {});
      });

    const discussionConfigUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/*`);
    axiosMock.onGet(discussionConfigUrl).reply(200, { provider: 'legacy' });

    // The outline sidebar (rendered via its trigger) fetches these at render.
    const navigationUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/v1/navigation/*`);
    axiosMock.onGet(navigationUrlRegExp).reply(200, courseBlocks);
    const sidebarTogglesUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/courses/.*/courseware-navigation-sidebar/toggles/`);
    axiosMock.onGet(sidebarTogglesUrlRegExp).reply(200, { enable_completion_tracking: true });
  }

  async function loadContainer() {
    const { container } = render(<BrowserRouter>{component}</BrowserRouter>);
    // Wait for the page spinner to be removed, such that we can wait for our main
    // content to load before making any assertions.
    await waitForElementToBeRemoved(screen.getByRole('status'));
    return container;
  }

  it('should initialize to show a spinner', () => {
    history.push('/course/abc123');
    render(<MemoryRouter initialEntries={['/course/abc123']}>{component}</MemoryRouter>);

    const spinner = screen.getByRole('status');

    expect(spinner.firstChild).toContainHTML(
      `<span class="sr-only">${tabMessages.loading.defaultMessage}</span>`,
    );
  });

  describe('when receiving successful course data', () => {
    // const courseMetadata = defaultCourseMetadata;
    const courseHomeMetadata = defaultCourseHomeMetadata;
    const courseId = defaultCourseId;

    function assertLoadedHeader(container) {
      const courseHeader = container.querySelector('.learning-header');
      // Ensure the course number and org appear - this proves we loaded course metadata properly.
      expect(courseHeader).toHaveTextContent(courseHomeMetadata.number);
      expect(courseHeader).toHaveTextContent(courseHomeMetadata.org);
      // Ensure the course title is showing up in the header.  This means we loaded course blocks properly.
      expect(courseHeader.querySelector('.course-title')).toHaveTextContent(courseHomeMetadata.title);
    }

    function assertNoSequenceNavigation(container) {
      const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation a, nav.sequence-navigation button');
      expect(sequenceNavButtons).toHaveLength(0);

      expect(container.querySelector('button, a')).not.toHaveTextContent('Previous');
      expect(container.querySelector('svg.fa-tasks')).toBeNull();
      expect(container.querySelector('button, a')).not.toHaveTextContent('Next');
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
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {
          sectionId: sequenceBlock.id,
          unitId: unitBlocks[1].id,
        });

        history.push(`/course/${courseId}`);
        const container = await loadContainer();

        assertLoadedHeader(container);
        assertNoSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
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
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {});

        history.push(`/course/${courseId}`);
        const container = await loadContainer();

        assertLoadedHeader(container);
        assertNoSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
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
        const expectedUrl = `http://localhost/course/${courseId}/${sequenceId}/${unitId}`;
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
          assertLoadedHeader(container);
          assertNoSequenceNavigation(container);
          assertLocation(container, sequenceTree[1][0].id, unitTree[1][0][0].id);
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
        sequenceTree[1].forEach(sequence => { delete blocksWithEmptySection[sequence.id]; });
        unitTree[1].flat().forEach(unit => { delete blocksWithEmptySection[unit.id]; });
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
          expect(global.location.href).toEqual(`http://localhost/course/${courseId}`);
        });
      });
    });

    describe('when the URL contains a unit marker', () => {
      it('should redirect /first to the first unit', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}/first`);
        await loadContainer();
        expect(global.location.href).toEqual(`http://localhost/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      });

      it('should redirect /last to the last unit', async () => {
        history.push(`/course/${courseId}/${defaultSequenceBlock.id}/last`);
        await loadContainer();
        expect(global.location.href).toEqual(`http://localhost/course/${courseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[2].id}`);
      });
    });

    describe('when the URL contains a course ID and sequence ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should pick the first unit if position was not defined (activeUnitIndex becomes 0)', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const container = await loadContainer();

        assertLoadedHeader(container);
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

        assertLoadedHeader(container);
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

        assertLoadedHeader(container);
        assertNoSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });

      it('should render the sequence_navigation plugin slot correctly', async () => {
        axiosMock
          .onPost(`${courseId}/xblock/${sequenceBlock.id}/handler/get_completion`)
          .reply(200, { complete: true });

        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[0].id}`);
        await loadContainer();

        expect(screen.getByTestId('org.openedx.frontend.learning.sequence_navigation.v1')).toBeInTheDocument();
      });

      it('marks the current unit complete when navigating to the next unit', async () => {
        const completionUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceBlock.id}/handler/get_completion`;
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
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {});

      history.push(`/course/${courseId}`);
      const container = await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/course/${courseId}`);
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
          developer_message: 'data_sharing_consent_url', // only used by data_sharing_access_required
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

      expect(global.location.href).toEqual(`http://localhost/course/${courseMetadata.id}/home`);
    });

    it('should go to course survey for a survey_required error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('survey_required');
      await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/redirect/survey/${courseMetadata.id}`);
    });

    it('should go to consent page for a data_sharing_access_required error code', async () => {
      setUpWithDeniedStatus('data_sharing_access_required');
      await loadContainer();

      expect(global.location.href).toEqual('http://localhost/redirect/consent?consentPath=data_sharing_consent_url');
    });

    it('should go to access denied page for a incorrect_active_enterprise error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('incorrect_active_enterprise');
      await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/course/${courseMetadata.id}/access-denied`);
    });

    it('should go to course home for an authentication_required error code', async () => {
      const { courseMetadata } = setUpWithDeniedStatus('authentication_required');
      await loadContainer();

      expect(global.location.href).toEqual(`http://localhost/course/${courseMetadata.id}/home`);
    });

    it('should go to dashboard for an unfulfilled_milestones error code', async () => {
      setUpWithDeniedStatus('unfulfilled_milestones');
      await loadContainer();

      expect(global.location.href).toEqual('http://localhost/redirect/dashboard');
    });

    it('should go to the dashboard with an attached access_response_error for an audit_expired error code', async () => {
      setUpWithDeniedStatus('audit_expired');
      await loadContainer();

      expect(global.location.href).toEqual('http://localhost/redirect/dashboard?access_response_error=uhoh%20oh%20no');
    });

    it('should go to the dashboard with a notlive start date for a course_not_started error code', async () => {
      setUpWithDeniedStatus('course_not_started');
      await loadContainer();

      const startDate = '2/5/2013'; // This date is based on our courseMetadata factory's sample data.
      expect(global.location.href).toEqual(`http://localhost/redirect/dashboard?notlive=${startDate}`);
    });

    it('should go to the enterprise learner dashboard for a course_not_started_enterprise_learner error code', async () => {
      setUpWithDeniedStatus('course_not_started_enterprise_learner');
      await loadContainer();

      expect(global.location.href).toEqual('http://localhost/redirect/enterprise-learner-dashboard');
    });
  });

  describe('request count', () => {
    it('requests the course metadata once per load', async () => {
      setUpMockRequests();
      history.push(`/course/${defaultCourseId}/${defaultSequenceBlock.id}/${defaultUnitBlocks[0].id}`);
      await loadContainer();
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));

      const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${defaultCourseId}`);
      expect(axiosMock.history.get.filter((req) => req.url === courseHomeMetadataUrl)).toHaveLength(1);
    });
  });
});
