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

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('CoursewareContainer', () => {
  let store;
  let component;

  beforeEach(() => {
    axiosMock.reset();

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

  it('should successfully render sequence navigation and unit', async () => {
    const courseMetadata = Factory.build('courseMetadata');
    const courseId = courseMetadata.id;
    const { courseBlocks, unitBlocks, sequenceBlock } = buildSimpleCourseBlocks(courseId, courseMetadata.name);
    const sequenceMetadata = Factory.build(
      'sequenceMetadata',
      {},
      { courseId, unitBlocks, sequenceBlock: sequenceBlock[0] },
    );

    const courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;
    const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);
    const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceBlock[0].id}`;
    const unitId = unitBlocks[0].id;

    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
    axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`).reply(200, {
      sectionId: sequenceBlock[0].id,
      unitId: unitBlocks[0].id,
    });
    axiosMock.onGet(sequenceMetadataUrl).reply(200, sequenceMetadata);

    // Print out any URLs that we didn't handle above - useful for debugging the test.
    axiosMock.onAny().reply((config) => {
      // eslint-disable-next-line no-console
      console.log(config.url);
      return [200, {}];
    });
    // On page load, SequenceContext attempts to scroll to the top of the page.
    global.scrollTo = jest.fn();
    history.push(`/course/${courseId}`);
    const { container } = render(component);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    const courseHeader = container.querySelector('.course-header');
    // Ensure the course number and org appear - this proves we loaded course metadata properly.
    expect(courseHeader).toHaveTextContent(courseMetadata.number);
    expect(courseHeader).toHaveTextContent(courseMetadata.org);
    // Ensure the course title is showing up in the header.  This means we loaded course blocks properly.
    expect(courseHeader.querySelector('.course-title')).toHaveTextContent(courseMetadata.name);

    // Ensure we had appropriate sequence navigation buttons.  We should only have one unit.
    const sequenceNavButtons = container.querySelectorAll('nav.sequence-navigation button');
    expect(sequenceNavButtons).toHaveLength(3);

    expect(sequenceNavButtons[0]).toHaveTextContent('Previous');
    // Prove this button is rendering an SVG book icon, meaning it's a unit.
    expect(sequenceNavButtons[1].querySelector('svg')).toHaveClass('fa-tasks');
    expect(sequenceNavButtons[2]).toHaveTextContent('Next');

    expect(container.querySelector('.fake-unit')).toHaveTextContent('Unit Contents');
    expect(container.querySelector('.fake-unit')).toHaveTextContent(courseId);
    expect(container.querySelector('.fake-unit')).toHaveTextContent(unitId);
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
        { courseId, unitBlocks, sequenceBlock: sequenceBlock[0] },
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
