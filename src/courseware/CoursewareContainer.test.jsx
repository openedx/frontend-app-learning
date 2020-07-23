import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Route, Switch } from 'react-router';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { UserMessagesProvider } from '../generic/user-messages';
import tabMessages from '../tab-page/messages';
import initializeMockApp from '../setupTest';

import CoursewareContainer from './CoursewareContainer';
import buildSimpleCourseBlocks from './data/__factories__/courseBlocks.factory';
import initializeStore from '../store';

// NOTE: Because the unit creates an iframe, we choose to mock it out as its rendering isn't
// pertinent to this test.  Instead, we render a simple div that displays the properties we expect
// to have been passed into the component.  Separate tests can handle unit rendering, but this
// proves that the component is rendered and receives the correct props.  We probably COULD render
// Unit.jsx and its iframe in this test, but it's already complex enough.
function MockUnit({ courseId, id }) { // eslint-disable-line react/prop-types
  return (
    <div className="fake-unit">Unit Contents {courseId} {id}</div>
  );
}

jest.mock(
  './course/sequence/Unit',
  () => MockUnit,
);

initializeMockApp();

describe('CoursewareContainer', () => {
  let store;
  let component;
  let axiosMock;

  beforeEach(() => {
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

  it('should initialize to show a spinner', () => {
    history.push('/course/abc123');
    render(component);

    const spinner = screen.getByRole('status');

    expect(spinner.firstChild).toContainHTML(
      `<span class="sr-only">${tabMessages.loading.defaultMessage}</span>`,
    );
  });

  describe('when receiving successful course data', () => {
    let courseId;
    let courseMetadata;
    let courseBlocks;
    let sequenceMetadata;

    let sequenceBlock;
    let unitBlocks;

    function assertLoadedHeader(container) {
      const courseHeader = container.querySelector('.course-header');
      // Ensure the course number and org appear - this proves we loaded course metadata properly.
      expect(courseHeader).toHaveTextContent(courseMetadata.number);
      expect(courseHeader).toHaveTextContent(courseMetadata.org);
      // Ensure the course title is showing up in the header.  This means we loaded course blocks properly.
      expect(courseHeader.querySelector('.course-title')).toHaveTextContent(courseMetadata.name);
    }

    function assertSequenceNavigation(container) {
      // Ensure we had appropriate sequence navigation buttons.  We should only have one unit.
      const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation button');
      expect(sequenceNavButtons).toHaveLength(5);

      expect(sequenceNavButtons[0]).toHaveTextContent('Previous');
      // Prove this button is rendering an SVG book icon, meaning it's a unit.
      expect(sequenceNavButtons[1].querySelector('svg')).toHaveClass('fa-book');
      expect(sequenceNavButtons[4]).toHaveTextContent('Next');
    }

    function setupMockRequests() {
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`).reply(200, courseMetadata);
      axiosMock.onGet(new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`)).reply(200, courseBlocks);
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceBlock.id}`).reply(200, sequenceMetadata);
    }

    beforeEach(async () => {
      // On page load, SequenceContext attempts to scroll to the top of the page.
      global.scrollTo = jest.fn();

      courseMetadata = Factory.build('courseMetadata');
      courseId = courseMetadata.id;

      const result = buildSimpleCourseBlocks(courseId, courseMetadata.name, 3); // 3 is for 3 units
      courseBlocks = result.courseBlocks;
      unitBlocks = result.unitBlocks;
      sequenceBlock = result.sequenceBlock;

      sequenceMetadata = Factory.build(
        'sequenceMetadata',
        {},
        { courseId, unitBlocks, sequenceBlock },
      );

      setupMockRequests();
    });

    describe('when the URL only contains a course ID', () => {
      it('should use the resume block repsonse to pick a unit if it contains one', async () => {
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {
          sectionId: sequenceBlock.id,
          unitId: unitBlocks[1].id,
        });

        history.push(`/course/${courseId}`);
        const { container } = render(component);

        // This is an important line that ensures the spinner has been removed - and thus our main
        // content has been loaded - prior to proceeding with our expectations.
        await waitForElementToBeRemoved(screen.getByRole('status'));

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[1].id);
      });

      it('should use the first sequence ID and activeUnitIndex if the resume block response is empty', async () => {
        // OVERRIDE SEQUENCE METADATA:
        // set the position to the third unit so we can prove activeUnitIndex is working
        sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { position: 3 }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );

        // Re-call the mock setup now that sequenceMetadata is different.
        setupMockRequests();
        // Note how there is no sectionId/unitId returned in this mock response!
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {});

        history.push(`/course/${courseId}`);
        const { container } = render(component);

        // This is an important line that ensures the spinner has been removed - and thus our main
        // content has been loaded - prior to proceeding with our expectations.
        await waitForElementToBeRemoved(screen.getByRole('status'));

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });

    describe('when the URL contains a course ID and sequence ID', () => {
      it('should pick the first unit if position was not defined (activeUnitIndex becomes 0)', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const { container } = render(component);

        // This is an important line that ensures the spinner has been removed - and thus our main
        // content has been loaded - prior to proceeding with our expectations.
        await waitForElementToBeRemoved(screen.getByRole('status'));

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[0].id);
      });

      it('should use activeUnitIndex to pick a unit from the sequence', async () => {
        // OVERRIDE SEQUENCE METADATA:
        sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { position: 3 }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );

        // Re-call the mock setup now that sequenceMetadata is different.
        setupMockRequests();

        history.push(`/course/${courseId}/${sequenceBlock.id}`);
        const { container } = render(component);

        // This is an important line that ensures the spinner has been removed - and thus our main
        // content has been loaded - prior to proceeding with our expectations.
        await waitForElementToBeRemoved(screen.getByRole('status'));

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });

    describe('when the URL contains a course, sequence, and unit ID', () => {
      it('should load the specified unit', async () => {
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[2].id}`);
        const { container } = render(component);

        // This is an important line that ensures the spinner has been removed - and thus our main
        // content has been loaded - prior to proceeding with our expectations.
        await waitForElementToBeRemoved(screen.getByRole('status'));

        assertLoadedHeader(container);
        assertSequenceNavigation(container);

        expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
        expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
        expect(container.querySelector('.fake-unit')).toHaveTextContent(unitBlocks[2].id);
      });
    });

    describe('when the current sequence is an exam', () => {
      const { location } = window;

      beforeEach(() => {
        delete window.location;
        window.location = {
          assign: jest.fn(),
        };
      });

      afterEach(() => {
        window.location = location;
      });

      it('should redirect to the sequence lmsWebUrl', async () => {
        // OVERRIDE SEQUENCE METADATA:
        sequenceMetadata = Factory.build(
          'sequenceMetadata',
          { is_time_limited: true }, // position index is 1-based and is converted to 0-based for activeUnitIndex
          { courseId, unitBlocks, sequenceBlock },
        );

        // Re-call the mock setup now that sequenceMetadata is different.
        setupMockRequests();
        history.push(`/course/${courseId}/${sequenceBlock.id}/${unitBlocks[2].id}`);
        render(component);

        // This is an important line that ensures the spinner has been removed - and thus our main
        // content has been loaded - prior to proceeding with our expectations.
        await waitForElementToBeRemoved(screen.getByRole('status'));

        expect(global.location.assign).toHaveBeenCalledWith(sequenceBlock.lms_web_url);
      });
    });
  });

  describe('when receiving a can_load_courseware error_code', () => {
    let courseMetadata;

    function setupWithDeniedStatus(errorCode) {
      courseMetadata = Factory.build('courseMetadata', {
        can_load_courseware: {
          has_access: false,
          error_code: errorCode,
          additional_context_user_message: 'uhoh oh no', // only used by audit_expired
        },
      });
      const courseId = courseMetadata.id;
      const { courseBlocks, unitBlocks, sequenceBlock } = buildSimpleCourseBlocks(courseId, courseMetadata.name);
      const sequenceMetadata = Factory.build(
        'sequenceMetadata',
        {},
        { courseId, unitBlocks, sequenceBlock },
      );

      const forbiddenCourseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;
      const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);
      const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceBlock.id}`;

      axiosMock.onGet(forbiddenCourseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
      axiosMock.onGet(sequenceMetadataUrl).reply(200, sequenceMetadata);

      history.push(`/course/${courseId}`);
    }

    it('should go to course home for an enrollment_required error code', async () => {
      setupWithDeniedStatus('enrollment_required');

      render(component);
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(global.location.href).toEqual(`http://localhost/redirect/course-home/${courseMetadata.id}`);
    });

    it('should go to course home for an authentication_required error code', async () => {
      setupWithDeniedStatus('authentication_required');

      render(component);
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(global.location.href).toEqual(`http://localhost/redirect/course-home/${courseMetadata.id}`);
    });

    it('should go to dashboard for an unfulfilled_milestones error code', async () => {
      setupWithDeniedStatus('unfulfilled_milestones');

      render(component);
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(global.location.href).toEqual('http://localhost/redirect/dashboard');
    });

    it('should go to the dashboard with an attached access_response_error for an audit_expired error code', async () => {
      setupWithDeniedStatus('audit_expired');

      render(component);
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(global.location.href).toEqual('http://localhost/redirect/dashboard?access_response_error=uhoh%20oh%20no');
    });

    it('should go to the dashboard with a notlive start date for a course_not_started error code', async () => {
      setupWithDeniedStatus('course_not_started');

      render(component);
      await waitForElementToBeRemoved(screen.getByRole('status'));

      const startDate = '2/5/2013'; // This date is based on our courseMetadata factory's sample data.
      expect(global.location.href).toEqual(`http://localhost/redirect/dashboard?notlive=${startDate}`);
    });
  });
});
