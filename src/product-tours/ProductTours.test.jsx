/**
 * @jest-environment jsdom
 */
import React from 'react';
import { Route, Switch } from 'react-router';
import { Factory } from 'rosie';
import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import * as popper from '@popperjs/core';

import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen,
} from '../setupTest';
import initializeStore from '../store';
import { appendBrowserTimezoneToUrl, executeThunk } from '../utils';

import CoursewareContainer from '../courseware/CoursewareContainer';
import LoadedTabPage from '../tab-page/LoadedTabPage';
import OutlineTab from '../course-home/outline-tab/OutlineTab';
import * as courseHomeThunks from '../course-home/data/thunks';
import { buildSimpleCourseBlocks } from '../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from '../courseware/data/__factories__/learningSequencesOutline.factory';

import { UserMessagesProvider } from '../generic/user-messages';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');
const popperMock = jest.spyOn(popper, 'createPopper');

describe('Course Home Tours', () => {
  let axiosMock;

  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const defaultMetadata = Factory.build('courseHomeMetadata');

  const outlineUrl = `${getConfig().LMS_BASE_URL}/api/course_home/outline/${courseId}`;
  const tourDataUrl = `${getConfig().LMS_BASE_URL}/api/user_tours/v1/MockUser`;
  const proctoringUrl = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/user_onboarding/status?is_learning_mfe=true&course_id=course-v1%3AedX%2BTest%2Brun&username=MockUser`;

  const store = initializeStore();
  const defaultTabData = Factory.build('outlineTabData');

  function setMetadata(attributes, options) {
    const courseMetadata = Factory.build('courseHomeMetadata', attributes, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

  function setTourData(tourData, response = 200, isEnrolled = true) {
    setMetadata({ is_enrolled: isEnrolled });
    axiosMock.onGet(tourDataUrl).reply(response, tourData);
  }

  async function fetchAndRender() {
    await executeThunk(courseHomeThunks.fetchOutlineTab(courseId), store.dispatch);
    render(
      <LoadedTabPage courseId={courseId} activeTabSlug="outline">
        <OutlineTab />
      </LoadedTabPage>,
      { store },
    );
  }

  beforeEach(async () => {
    popperMock.mockImplementation(jest.fn());

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Set defaults for network requests
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onGet(outlineUrl).reply(200, defaultTabData);
    axiosMock.onGet(proctoringUrl).reply(404, {});
    axiosMock.onGet(tourDataUrl).reply(200, {
      course_home_tour_status: 'no-tour',
      show_courseware_tour: false,
    });

    logUnhandledRequests(axiosMock);
  });

  afterEach(() => {
    popperMock.mockReset();
  });

  describe('for new users', () => {
    beforeEach(async () => {
      setTourData({
        course_home_tour_status: 'show-new-user-tour',
        show_courseware_tour: false,
      });
      await fetchAndRender();
    });

    it('renders modal', async () => {
      expect(await screen.findByRole('dialog', { name: 'New user course home prompt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Begin tour' })).toBeInTheDocument();
    });

    it('renders checkpoint on click of "Begin tour"', async () => {
      const beginTourButton = await screen.findByRole('button', { name: 'Begin tour' });
      fireEvent.click(beginTourButton);

      expect(await screen.findByRole('dialog', { name: 'Take the course!' }));
    });
  });

  describe('for eligible existing users', () => {
    it('renders correctly', async () => {
      setTourData({
        course_home_tour_status: 'show-existing-user-tour',
        show_courseware_tour: false,
      });
      await fetchAndRender();

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('We’ve recently added a few new features to the course experience.', { exact: false })).toBeInTheDocument();
    });
  });

  describe('for non-eligible existing users', () => {
    beforeEach(async () => {
      setTourData({
        course_home_tour_status: 'no-tour',
        show_courseware_tour: false,
      });
      await fetchAndRender();
    });

    it('does not render a tour', async () => {
      expect(await screen.queryByRole('dialog', { name: 'Take the course!' })).not.toBeInTheDocument();
    });

    it('launches tour on button click', async () => {
      const launchTourButton = await screen.findByRole('button', { name: 'Launch tour' });
      expect(launchTourButton).toBeInTheDocument();

      fireEvent.click(launchTourButton);

      expect(await screen.findByRole('dialog', { name: 'Take the course!' })).toBeInTheDocument();
    });
  });

  it.each`
  errorStatus
  ${401}
  ${403}
  ${404}
  `('does not render tour components for $errorStatus response', async (errorStatus) => {
  setTourData({}, errorStatus, false);

  // Verify no launch tour button
  expect(await screen.queryByRole('button', { name: 'Launch tour' })).not.toBeInTheDocument();

  // Verify no Checkpoint or MarketingModal has rendered
  expect(await screen.queryByRole('dialog')).not.toBeInTheDocument();
});
});

function MockUnit({ courseId, id }) { // eslint-disable-line react/prop-types
  return (
    <div id="courseware-sequenceNavigation" className="fake-unit">Unit Contents {courseId} {id}</div>
  );
}

jest.mock(
  '../courseware/course/sequence/Unit',
  () => MockUnit,
);

describe('Courseware Tour', () => {
  let store;
  let component;
  let axiosMock;

  // This is a standard set of data that can be used in CoursewareContainer tests.
  // By default, `setUpMockRequests()` will configure the mock LMS API to return use this data.
  // Certain test cases override these in order to test with special blocks/metadata.
  const defaultCourseMetadata = Factory.build('courseMetadata');

  const courseId = defaultCourseMetadata.id;
  const unitBlocks = [
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId },
    ),
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId },
    ),
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId },
    ),
  ];
  const {
    courseBlocks,
    sequenceBlocks: [defaultSequenceBlock],
  } = buildSimpleCourseBlocks(
    courseId,
    defaultCourseMetadata.name,
    { unitBlocks },
  );

  beforeEach(() => {
    popperMock.mockImplementation(jest.fn());

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    store = initializeStore();

    component = (
      <AppProvider store={store}>
        <UserMessagesProvider>
          <Switch>
            <Route
              path={[
                '/course/:courseId/:sequenceId/:unitId',
                '/course/:courseId/:sequenceId',
                '/course/:courseId',
              ]}
              component={CoursewareContainer}
            />
          </Switch>
        </UserMessagesProvider>
      </AppProvider>
    );
  });

  async function loadContainer() {
    const { container } = render(component);
    // Wait for the page spinner to be removed, such that we can wait for our main
    // content to load before making any assertions.
    await waitForElementToBeRemoved(screen.getByRole('status'));
    return container;
  }

  describe('when receiving successful course data', () => {
    const tourDataUrl = `${getConfig().LMS_BASE_URL}/api/user_tours/v1/MockUser`;

    beforeEach(async () => {
      // On page load, SequenceContext attempts to scroll to the top of the page.
      global.scrollTo = jest.fn();

      // If we weren't given a list of sequence metadatas for URL mocking,
      // then construct it ourselves by looking at courseBlocks.
      const sequenceMetadatas = (
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
      axiosMock.onGet(learningSequencesUrlRegExp).reply(200, buildOutlineFromBlocks(courseBlocks));

      const courseMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`);
      axiosMock.onGet(courseMetadataUrl).reply(200, defaultCourseMetadata);

      const defaultCourseHomeMetadata = Factory.build('courseHomeMetadata');
      const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`);
      axiosMock.onGet(courseHomeMetadataUrl).reply(200, defaultCourseHomeMetadata);

      sequenceMetadatas.forEach(sequenceMetadata => {
        const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;
        axiosMock.onGet(sequenceMetadataUrl).reply(200, sequenceMetadata);
        const proctoredExamApiUrl = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${courseId}/content_id/${sequenceMetadata.item_id}?is_learning_mfe=true`;
        axiosMock.onGet(proctoredExamApiUrl).reply(404);
      });

      const blockUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/*`);
      axiosMock.onPost(blockUrlRegExp).reply(200, { complete: true });
      const discussionConfigUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/*`);
      axiosMock.onGet(discussionConfigUrl).reply(200, { provider: 'legacy' });

      history.push(`/course/${courseId}/${defaultSequenceBlock.id}/${unitBlocks[0].id}`);
    });

    it.each`
  showCoursewareTour
  ${true}
  ${false}
`('should load courseware checkpoint correctly if tour enabled is $showCoursewareTour', async (showCoursewareTour) => {
  axiosMock.onGet(tourDataUrl).reply(200, {
    course_home_tour_status: 'no-tour',
    show_courseware_tour: showCoursewareTour,
  });

  const container = await loadContainer();

  const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation button');
  const sequenceNextButton = sequenceNavButtons[4];
  expect(sequenceNextButton).toHaveTextContent('Next');
  fireEvent.click(sequenceNextButton);

  expect(global.location.href).toEqual(`http://localhost/course/${courseId}/${defaultSequenceBlock.id}/${unitBlocks[1].id}`);

  const checkpoint = container.querySelectorAll('#pgn__checkpoint');
  expect(checkpoint).toHaveLength(showCoursewareTour ? 1 : 0);
});
  });
});
