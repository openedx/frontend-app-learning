import {
  APP_INIT_ERROR, APP_READY, subscribe,
} from '@edx/frontend-platform';

// Jest needs this for module resolution
import * as app from '.'; // eslint-disable-line @typescript-eslint/no-unused-vars

// These need to be var not let so they get hoisted
// and can be used by jest.mock (which is also hoisted)
var mockRender; // eslint-disable-line no-var
var mockCreateRoot; // eslint-disable-line no-var
jest.mock('react-dom/client', () => {
  mockRender = jest.fn();
  mockCreateRoot = jest.fn(() => ({
    render: mockRender,
  }));

  return ({
    createRoot: mockCreateRoot,
  });
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  StrictMode: 'React Strict Mode',
}));

jest.mock('@edx/frontend-platform', () => ({
  APP_READY: 'app-is-ready-key',
  APP_INIT_ERROR: 'app-init-error',
  subscribe: jest.fn(),
  initialize: jest.fn(),
  mergeConfig: jest.fn(),
  getConfig: () => ({
    FAVICON_URL: 'favicon-url',
  }),
  ensureConfig: jest.fn(),
}));

jest.mock('./generic/PageNotFound', () => 'Page Not Found');
jest.mock('./course-home/goal-unsubscribe', () => 'Goal Unsubscribe');
jest.mock('./courseware/CoursewareRedirectLandingPage', () => 'Courseware Redirect Landing Page');
jest.mock('./preferences-unsubscribe', () => 'Preferences Unsubscribe');
jest.mock('./generic/CourseAccessErrorPage', () => 'Course Access Error Page');
jest.mock('./tab-page', () => ({ TabContainer: 'Tab Container' }));
jest.mock('./course-home/outline-tab', () => 'Outline Tab');
jest.mock('./course-home/live-tab/LiveTab', () => 'Live Tab');
jest.mock('./course-home/dates-tab', () => 'Dates Tab');
jest.mock('./course-home/discussion-tab/DiscussionTab', () => 'Discussion Tab');
jest.mock('./course-home/progress-tab/ProgressTab', () => 'Progress Tab');
jest.mock('./courseware/course/course-exit', () => ({ CourseExit: 'Course Exit' }));
jest.mock('./courseware', () => 'Courseware Container');

describe('app registry', () => {
  let getElement;

  beforeEach(() => {
    mockCreateRoot.mockClear();
    mockRender.mockClear();

    getElement = window.document.getElementById;
    window.document.getElementById = jest.fn(id => ({ id }));
  });
  afterAll(() => {
    window.document.getElementById = getElement;
  });

  test('subscribe: APP_READY.  links App to root element', () => {
    const callArgs = subscribe.mock.calls[0];
    expect(callArgs[0]).toEqual(APP_READY);
    callArgs[1]();
    const [rendered] = mockRender.mock.calls[0];
    expect(rendered).toMatchSnapshot();
  });
  test('subscribe: APP_INIT_ERROR.  snapshot: displays an ErrorPage to root element', () => {
    const callArgs = subscribe.mock.calls[1];
    expect(callArgs[0]).toEqual(APP_INIT_ERROR);
    const error = { message: 'test-error-message' };
    callArgs[1](error);
    const [rendered] = mockRender.mock.calls[0];
    expect(rendered).toMatchSnapshot();
  });
});
