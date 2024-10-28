import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { waitForElementToBeRemoved, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  BrowserRouter, MemoryRouter, Route, Routes,
} from 'react-router-dom';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { UserMessagesProvider } from '../generic/user-messages';
import tabMessages from '../tab-page/messages';
import { initializeMockApp, waitFor } from '../setupTest';
import { DECODE_ROUTES } from '../constants';

import CoursewareContainer, {
  checkResumeRedirect,
  checkSectionToSequenceRedirect,
  checkSectionUnitToUnitRedirect,
  checkSequenceToSequenceUnitRedirect,
  checkSequenceUnitMarkerToSequenceUnitRedirect,
  checkUnitToSequenceUnitRedirect,
} from './CoursewareContainer';
import { buildSimpleCourseBlocks, buildBinaryCourseBlocks } from '../shared/data/__factories__/courseBlocks.factory';
import initializeStore from '../store';
import { appendBrowserTimezoneToUrl } from '../utils';
import { buildOutlineFromBlocks } from './data/__factories__/learningSequencesOutline.factory';
import { getSequenceForUnitDeprecatedUrl } from './data/api';

// NOTE: Because the unit creates an iframe, we choose to mock it out as its rendering isn't
// pertinent to this test.  Instead, we render a simple div that displays the properties we expect
// to have been passed into the component.  Separate tests can handle unit rendering, but this
// proves that the component is rendered and receives the correct props.  We probably COULD render
// Unit.jsx and its iframe in this test, but it's already complex enough.

jest.mock(
  './course/sequence/Unit',
  // eslint-disable-next-line react/prop-types
  () => function ({ courseId, id }) {
    return <div className="fake-unit">Unit Contents {courseId} {id}</div>;
  },
);

jest.mock('@edx/frontend-platform/analytics');

initializeMockApp();

describe('CoursewareContainer', () => {
  let store;
  let component;
  let axiosMock;

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

    component = (
      <AppProvider store={store} wrapWithRouter={false}>
        <UserMessagesProvider>
          <Routes>
            {DECODE_ROUTES.COURSEWARE.map((route) => (
              <Route
                key={route}
                path={route}
                element={<CoursewareContainer />}
              />
            ))}
          </Routes>
        </UserMessagesProvider>
      </AppProvider>
    );
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

    function assertSequenceNavigation(container, expectedUnitCount = 3) {
      // Ensure we had appropriate sequence navigation buttons.  We should only have one unit.
      const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation a, nav.sequence-navigation button');
      expect(sequenceNavButtons).toHaveLength(expectedUnitCount + 2);

      expect(sequenceNavButtons[0]).toHaveTextContent('Previous');
      // Prove this button is rendering an SVG tasks icon, meaning it's a unit/vertical.
      expect(sequenceNavButtons[1].querySelector('svg')).toHaveClass('fa-tasks');
      expect(sequenceNavButtons[sequenceNavButtons.length - 1]).toHaveTextContent('Next');
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
        const container = await waitFor(() => loadContainer());

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

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
        const container = await waitFor(() => loadContainer());

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

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

      // describe('when the URL contains a unit ID', () => {
      //   it('should ignore the section ID and redirect based on the unit ID', async () => {
      //     const urlUnit = unitTree[1][1][1];
      //     setUrl(sectionTree[1].id, urlUnit.id);
      //     const container = await loadContainer();
      //     assertLoadedHeader(container);
      //     assertSequenceNavigation(container, 2);
      //     assertLocation(container, sequenceTree[1][1].id, urlUnit.id);
      //   });

      //   it('should ignore invalid unit IDs and redirect to the course root', async () => {
      //     setUrl(sectionTree[1].id, 'foobar');
      //     await loadContainer();
      //     expect(global.location.href).toEqual(`http://localhost/course/${courseId}`);
      //   });
      // });

      describe('when the URL does not contain a unit ID', () => {
        it('should choose a unit within the section\'s first sequence', async () => {
          setUrl(sectionTree[1].id);
          const container = await waitFor(() => loadContainer());
          assertLoadedHeader(container);
          assertSequenceNavigation(container, 2);
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

    // describe('when the URL only contains a unit ID', () => {
    //   const { courseBlocks, unitTree, sequenceTree } = buildBinaryCourseBlocks(courseId, courseMetadata.name);

    //   beforeEach(async () => {
    //     setUpMockRequests({ courseBlocks });
    //   });

    //   it('should insert the sequence ID into the URL', async () => {
    //     const unit = unitTree[1][0][1];
    //     history.push(`/course/${courseId}/${unit.id}`);
    //     const container = await loadContainer();

    //     assertLoadedHeader(container);
    //     assertSequenceNavigation(container, 2);
    //     const expectedSequenceId = sequenceTree[1][0].id;
    //     const expectedUrl = `http://localhost/course/${courseId}/${expectedSequenceId}/${unit.id}`;
    //     expect(global.location.href).toEqual(expectedUrl);
    //     expect(container.querySelector('.fake-unit')).toHaveTextContent(unit.id);
    //   });
    // });

    describe('when the URL contains a course ID and sequence ID', () => {
      const sequenceBlock = defaultSequenceBlock;
      const unitBlocks = defaultUnitBlocks;

      it('should pick the first unit if position was not defined (activeUnitIndex becomes 0)', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const container = await waitFor(() => loadContainer());

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

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
        const container = await waitFor(() => loadContainer());

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

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
        const container = await waitFor(() => loadContainer());

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });

      it('should navigate between units and check block completion', async () => {
        axiosMock.onPost(`${courseId}/xblock/${sequenceBlock.id}/handler/get_completion`).reply(200, {
          complete: true,
        });

        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[0].id}`);
        const container = await waitFor(() => loadContainer());

        const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation a, nav.sequence-navigation button');
        const sequenceNextButton = sequenceNavButtons[4];
        expect(sequenceNextButton).toHaveTextContent('Next');
        fireEvent.click(sequenceNextButton);

        expect(global.location.href).toEqual(`http://localhost/course/${courseId}/${sequenceBlock.id}/${unitBlocks[1].id}`);
      });
    });

    // describe('when the current sequence is an exam', () => {
    //   const { location } = window;

    //   beforeEach(() => {
    //     delete window.location;
    //     window.location = {
    //       assign: jest.fn(),
    //     };
    //   });

    //   afterEach(() => {
    //     window.location = location;
    //   });
    // });
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
});

describe('Course redirect functions', () => {
  let navigate;
  let axiosMock;

  beforeEach(() => {
    navigate = jest.fn();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  describe('isPreview equals true', () => {
    describe('checkSequenceUnitMarkerToSequenceUnitRedirect', () => {
      it('return when sequence is not loaded', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loading',
          { id: 'sequence_1', unitIds: ['unit_1'] },
          'first',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('return when sequence id is null', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: null, unitIds: ['unit_1'] },
          'first',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('calls navigate with first unit id', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          'first',
          navigate,
          true,
        );
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with last unit id', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          'last',
          navigate,
          true,
        );
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });

    describe('checkSequenceToSequenceUnitRedirect', () => {
      it('calls navigate with next unit id', () => {
        checkSequenceToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          null,
          navigate,
          true,
        );
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('returns when sequence status is loading', () => {
        checkSequenceToSequenceUnitRedirect(
          'courseId',
          'loading',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequence id is null', () => {
        checkSequenceToSequenceUnitRedirect(
          'courseId',
          'loading',
          { unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unit id is defined', () => {
        checkSequenceToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          'unit_2',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unit ids are undefiend', () => {
        checkSequenceToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', activeUnitIndex: 0 },
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('checkUnitToSequenceUnitRedirect', () => {
      const { href: apiUrl } = getSequenceForUnitDeprecatedUrl('courseId');

      it('calls navigate with parentId and sequenceId', () => {
        const getSequenceForUnitDeprecated = jest.fn();
        axiosMock.onGet(apiUrl).reply(200, {
          blocks: [{
            id: 'sequence_1',
            type: 'sequential',
            children: ['unit_1'],
          }],
        });

        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId/sequence_1';

        waitFor(() => {
          expect(getSequenceForUnitDeprecated).toHaveBeenCalled();
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when getSequenceForUnitDeprecated errors', () => {
        const getSequenceForUnitDeprecated = jest.fn();
        axiosMock.onGet(apiUrl).reply(404);

        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId';

        waitFor(() => {
          expect(getSequenceForUnitDeprecated).toHaveBeenCalled();
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when no parent id is returned', () => {
        const getSequenceForUnitDeprecated = jest.fn();
        axiosMock.onGet(apiUrl).reply(200, {
          blocks: [{
            id: 'sequence_1',
            type: 'sequential',
            children: ['block_1'],
          }],
        });

        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId';

        waitFor(() => {
          expect(getSequenceForUnitDeprecated).toHaveBeenCalled();
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when sequnce is not unit', () => {
        const getSequenceForUnitDeprecated = jest.fn();

        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          false,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId';

        waitFor(() => {
          expect(getSequenceForUnitDeprecated).not.toHaveBeenCalled();
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('returns when course status is loading', () => {
        checkUnitToSequenceUnitRedirect(
          'loading',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequence status is not failed', () => {
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is defined', () => {
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_1',
          true,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when routeUnitId is defined', () => {
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_1',
          false,
          'unit_1',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('checkSectionUnitToUnitRedirect', () => {
      it('calls navigate with unitId', () => {
        checkSectionUnitToUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_2',
          navigate,
          true,
        );
        const expectedUrl = '/preview/course/courseId/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('returns when course status is loading', () => {
        checkSectionUnitToUnitRedirect(
          'loading',
          'courseId',
          'loaded',
          true,
          'unit_2',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequence status is loading', () => {
        checkSectionUnitToUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_2',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is null', () => {
        checkSectionUnitToUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          null,
          'unit_2',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unitId is null', () => {
        checkSectionUnitToUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('checkResumeRedirect', () => {
      it('calls navigate with unitId', () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          unitId: 'unit_1',
        });
        checkResumeRedirect(
          'loaded',
          'courseId',
          null,
          'sequence_1',
          navigate,
          true,
        );
        const expectedUrl = '/preview/course/courseId/section_1/unit_1';

        waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate with firstSequenceId', () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          first_sequence_id: 'sequence_1',
        });
        checkResumeRedirect(
          'loaded',
          'courseId',
          null,
          'sequence_1',
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId/sequence_1';

        waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('returns after calling getResumeBlock', () => {
        const getResumeBlock = jest.fn();
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          course_id: 'courseId',
        });
        checkResumeRedirect(
          'loaded',
          'courseId',
          null,
          'sequence_1',
          navigate,
          true,
        );

        waitFor(() => {
          expect(getResumeBlock).toHaveBeenCalled();
          expect(navigate).not.toHaveBeenCalled();
        });
      });

      it('returns when course status is loading', () => {
        checkResumeRedirect(
          'loading',
          'courseId',
          null,
          'sequence_1',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequenceId is defined', () => {
        checkResumeRedirect(
          'loaded',
          'courseId',
          'sequence_3',
          'sequence_1',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when getResumeBlock throws error', () => {
        const getResumeBlock = jest.fn();
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`).reply(404);
        checkResumeRedirect(
          'loaded',
          'courseId',
          null,
          'sequence_1',
          navigate,
          true,
        );

        waitFor(() => {
          expect(getResumeBlock).toHaveBeenCalled();
          expect(navigate).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('isPreview equals false', () => {
    describe('checkSectionToSequenceRedirect', () => {
      it('calls navigate with section based sequence id', () => {
        checkSectionToSequenceRedirect(
          'loaded',
          'courseId',
          'failed',
          { sequenceIds: ['sequence_1'] },
          null,
          navigate,
        );
        const expectedUrl = '/course/courseId/sequence_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with course id only', () => {
        checkSectionToSequenceRedirect(
          'loaded',
          'courseId',
          'failed',
          { sequenceIds: [] },
          null,
          navigate,
        );
        const expectedUrl = '/course/courseId';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('returns when course status is loading', () => {
        checkSectionToSequenceRedirect(
          'loading',
          'courseId',
          'failed',
          { sequenceIds: [] },
          null,
          navigate,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequence status is not failed', () => {
        checkSectionToSequenceRedirect(
          'loaded',
          'courseId',
          'loading',
          { sequenceIds: [] },
          null,
          navigate,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is not defined', () => {
        checkSectionToSequenceRedirect(
          'loaded',
          'courseId',
          'failed',
          null,
          null,
          navigate,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unitId is defined', () => {
        checkSectionToSequenceRedirect(
          'loaded',
          'courseId',
          'failed',
          null,
          'unit_1',
          navigate,
        );

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('checkResumeRedirect', () => {
      it('calls navigate with unitId', () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          unitId: 'unit_1',
        });
        checkResumeRedirect(
          'loaded',
          'courseId',
          null,
          'sequence_1',
          navigate,
          false,
        );
        const expectedUrl = '/preview/course/courseId/section_1/unit_1';

        waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate with firstSequenceId', () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          first_sequence_id: 'sequence_1',
        });
        checkResumeRedirect(
          'loaded',
          'courseId',
          null,
          'sequence_1',
          navigate,
          false,
        );
        const expectedUrl = '/course/courseId/sequence_1';

        waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });
    });

    describe('checkSequenceUnitMarkerToSequenceUnitRedirect', () => {
      it('calls navigate with first unit id', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          'first',
          navigate,
          false,
        );
        const expectedUrl = '/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with base url when no unit id', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: [] },
          'first',
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId/sequence_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with last unit id', () => {
        checkSequenceUnitMarkerToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          'last',
          navigate,
          false,
        );
        const expectedUrl = '/course/courseId/sequence_1/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });

    describe('checkSequenceToSequenceUnitRedirect', () => {
      it('calls navigate with next unit id', () => {
        checkSequenceToSequenceUnitRedirect(
          'courseId',
          'loaded',
          { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          null,
          navigate,
          false,
        );
        const expectedUrl = '/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });

    describe('checkUnitToSequenceUnitRedirect', () => {
      const apiUrl = getSequenceForUnitDeprecatedUrl('courseId');

      it('calls navigate with parentId and sequenceId', () => {
        axiosMock.onGet(apiUrl).reply(200, {
          parent: { id: 'sequence_1' },
        });
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId/sequence_1';

        waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when getSequenceForUnitDeprecated errors', () => {
        const getSequenceForUnitDeprecated = jest.fn();
        axiosMock.onGet(apiUrl).reply(404);
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId';

        waitFor(() => {
          expect(getSequenceForUnitDeprecated).toHaveBeenCalled();
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when no parent id is returned', () => {
        const getSequenceForUnitDeprecated = jest.fn();
        axiosMock.onGet(apiUrl).reply(200, {
          parent: { children: ['block_1'] },
        });
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );
        const expectedUrl = '/course/courseId';

        waitFor(() => {
          expect(getSequenceForUnitDeprecated).toHaveBeenCalled();
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('returns when course status is loading', () => {
        checkUnitToSequenceUnitRedirect(
          'loading',
          'courseId',
          'failed',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequence status is not failed', () => {
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_1',
          false,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is defined', () => {
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_1',
          true,
          null,
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when routeUnitId is defined', () => {
        checkUnitToSequenceUnitRedirect(
          'loaded',
          'courseId',
          'loaded',
          true,
          'unit_1',
          false,
          'unit_1',
          navigate,
          true,
        );

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('checkSectionUnitToUnitRedirect', () => {
      it('calls navigate with unitId', () => {
        checkSectionUnitToUnitRedirect(
          'loaded',
          'courseId',
          'failed',
          true,
          'unit_2',
          navigate,
          false,
        );
        const expectedUrl = '/course/courseId/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });
  });
});
