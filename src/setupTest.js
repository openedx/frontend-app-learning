import '@testing-library/jest-dom';
import './courseware/data/__factories__';
import './course-home/data/__factories__';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { configure as configureI18n, IntlProvider } from '@edx/frontend-platform/i18n';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import { configure as configureAuth, getAuthenticatedHttpClient, MockAuthService } from '@edx/frontend-platform/auth';
import React from 'react';
import PropTypes from 'prop-types';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { AppProvider } from '@edx/frontend-platform/react';
import { UserMessagesProvider } from './generic/user-messages';
import { ToastProvider } from './generic/ToastContext';
import { PluginOverridesProvider } from './generic/plugin-overrides';
import { mockSpecialExams } from './tests/mockSpecialExams';

import messages from './i18n';
import { appendBrowserTimezoneToUrl } from './utils';
import buildSimpleCourseAndSequenceMetadata from './courseware/data/__factories__/sequenceMetadata.factory';
import { buildOutlineFromBlocks } from './courseware/data/__factories__/learningSequencesOutline.factory';
import { buildTopicsFromUnits } from './courseware/data/__factories__/discussionTopics.factory';

jest.mock('@openedx/frontend-plugin-framework', () => {
  // eslint-disable-next-line global-require
  const MockedPluginSlot = require('./tests/MockedPluginSlot').default;

  return {
    __esModule: true,
    Plugin: () => 'Plugin',
    PluginSlot: MockedPluginSlot,
  };
});

// Suppress known React deprecation warnings that originate in third-party
// packages (Paragon, react-fontawesome) and project components that still use
// defaultProps / propTypes on function components.  These are informational
// deprecations scheduled for a future React major version and do not indicate
// broken behaviour.  Narrow filters ensure real errors are never masked.
/* eslint-disable no-console */
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const msg = String(args[0] ?? '');
    if (
      msg.includes('forwardRef render functions do not support propTypes or defaultProps')
      || msg.includes('Support for defaultProps will be removed from function components')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});
/* eslint-enable no-console */

class MockLoggingService {
  // eslint-disable-next-line no-console
  logInfo = jest.fn(infoString => console.log(infoString));

  // eslint-disable-next-line no-console
  logError = jest.fn(errorString => console.log(errorString));
}

window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(),
}));

/* eslint-disable no-console */
const supressWarningBlock = (callback) => {
  const originalConsoleWarning = console.warn;
  console.warn = jest.fn();
  callback();
  console.warn = originalConsoleWarning;
};
/* eslint-enable no-console */

// Mocks for HTML Dialogs behavior. */
// jsdom does not support HTML Dialogs yet: https://github.com/jsdom/jsdom/issues/3294
HTMLDialogElement.prototype.show = jest.fn();
HTMLDialogElement.prototype.showModal = jest.fn(function mock() {
  const onShowModal = new CustomEvent('show_modal');
  this.dispatchEvent(onShowModal);
});
HTMLDialogElement.prototype.close = jest.fn(function mock() {
  const onClose = new CustomEvent('close');
  this.dispatchEvent(onClose);
});

// Mock Intersection Observer which is unavailable in the context of a test.
global.IntersectionObserver = jest.fn(function mockIntersectionObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

export const authenticatedUser = {
  userId: 'abc123',
  username: 'MockUser',
  roles: [],
  administrator: false,
};

mergeConfig({
  ...process.env,
  authenticatedUser: {
    userId: 'abc123',
    username: 'MockUser',
    roles: [],
    administrator: false,
  },
  SUPPORT_URL_ID_VERIFICATION: 'http://example.com',
});

export function initializeMockApp() {
  const loggingService = configureLogging(MockLoggingService, {
    config: getConfig(),
  });
  const authService = configureAuth(MockAuthService, {
    config: getConfig(),
    loggingService,
  });

  // i18n doesn't have a service class to return.
  // ignore missing/unexpect locale warnings from @edx/frontend-platform/i18n
  // it is unnecessary and not relevant to the tests
  supressWarningBlock(() => configureI18n({
    config: getConfig(),
    loggingService,
    messages,
  }));

  return { loggingService, authService };
}

window.scrollTo = jest.fn();

// MessageEvent used for indicating that a unit has been loaded.
export const messageEvent = {
  type: 'plugin.resize',
  payload: {
    height: 300,
  },
};

// Send MessageEvent indicating that a unit has been loaded.
export function loadUnit(message = messageEvent) {
  window.postMessage(message, '*');
}

// Helper function to log unhandled API requests to the console while running tests.
export function logUnhandledRequests(axiosMock) {
  axiosMock.onAny().reply((config) => {
    // eslint-disable-next-line no-console
    console.log(config.method, config.url);
    return [200, {}];
  });
}

// Mock the requests a course page makes (course and course-home metadata, the learning-sequences
// outline, the sequence metadata, discussion config and topics, the sidebar toggles and outline,
// the special-exams endpoints) for a factory-built course, one section with one sequence and one
// unit unless `options` supplies the blocks or payloads, and return the built payloads with the ids
// a test needs. `options` are passed through to `buildSimpleCourseAndSequenceMetadata`, plus
// `preventSequenceLoad` / `preventOutlineSidebarLoad` to hold those requests pending.
export function mockCourseRequests(options = {}) {
  initializeMockApp();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.reset();

  const fixtures = buildSimpleCourseAndSequenceMetadata(options);
  const {
    courseBlocks, sequenceBlocks, unitBlocks, courseMetadata, sequenceMetadata, courseHomeMetadata,
  } = fixtures;

  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseMetadata.id}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  const learningSequencesUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/*`);
  let courseHomeMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseMetadata.id}`;
  const discussionConfigUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/*`);
  const discussionTopicsUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseMetadata.id}`;
  const coursewareSidebarSettingsUrl = `${getConfig().LMS_BASE_URL}/courses/${courseMetadata.id}/courseware-navigation-sidebar/toggles/`;
  const outlineSidebarUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/navigation/${courseMetadata.id}`;
  courseHomeMetadataUrl = appendBrowserTimezoneToUrl(courseHomeMetadataUrl);

  const provider = options?.provider || 'legacy';
  const enabledInContext = options.enabledInContext ?? true;
  const enableCompletionTracking = options.enableCompletionTracking || { enable_completion_tracking: true };

  axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
  axiosMock.onGet(learningSequencesUrlRegExp).reply(200, buildOutlineFromBlocks(courseBlocks));
  axiosMock.onGet(discussionConfigUrl).reply(200, { provider });
  axiosMock.onGet(discussionTopicsUrl).reply(200, buildTopicsFromUnits(unitBlocks, enabledInContext));
  axiosMock.onGet(coursewareSidebarSettingsUrl).reply(200, {
    ...enableCompletionTracking,
  });

  if (options.preventOutlineSidebarLoad) {
    // Hold the sidebar-outline query in its pending state (the request never resolves).
    axiosMock.onGet(outlineSidebarUrl).reply(() => new Promise(() => {}));
  } else {
    axiosMock.onGet(outlineSidebarUrl).reply(200, {
      ...courseBlocks,
      ...sequenceBlocks,
      ...unitBlocks,
    });
  }

  sequenceMetadata.forEach(metadata => {
    const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${metadata.item_id}`;
    if (options.preventSequenceLoad) {
      // Hold the sequence metadata query in its pending state (the request never resolves).
      axiosMock.onGet(sequenceMetadataUrl).reply(() => new Promise(() => {}));
    } else {
      axiosMock.onGet(sequenceMetadataUrl).reply(200, metadata);
    }
  });

  // Before the catch-all below: axios-mock-adapter matches handlers in registration order.
  const specialExams = mockSpecialExams(axiosMock, courseMetadata.id);

  logUnhandledRequests(axiosMock);

  return {
    ...fixtures,
    courseId: courseMetadata.id,
    sequenceId: sequenceBlocks[0].id,
    unitId: unitBlocks[0].id,
    specialExams,
  };
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

// Seed a query result so components under test render as loaded without fetching.
// The seeded entry is marked never-stale so mounting observers don't refetch over it.
export function seedQueryData(queryClient, queryKey, data) {
  queryClient.setQueryDefaults(queryKey, { staleTime: Infinity });
  queryClient.setQueryData(queryKey, data);
}

// `store`: pass the app's `initializeStore()` when the tree reaches `@edx/frontend-lib-special-exams`
// (`Sequence`, `Unit`, `TabWithTimer`), whose components select from the Redux store; `AppProvider`
// renders a react-redux `Provider` only when given one.
/**
 * @param {React.ReactElement} ui
 * @param {{ store?: ReturnType<typeof import('./store').default> | null, wrapWithRouter?: boolean }} [options]
 */
function render(
  ui,
  {
    store = null,
    wrapWithRouter = false,
    ...renderOptions
  } = {},
) {
  const testQueryClient = createTestQueryClient();
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={wrapWithRouter}>
        <QueryClientProvider client={testQueryClient}>
          <UserMessagesProvider>
            <ToastProvider>
              <PluginOverridesProvider>
                {children}
              </PluginOverridesProvider>
            </ToastProvider>
          </UserMessagesProvider>
        </QueryClientProvider>
      </AppProvider>
    </IntlProvider>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything.
export * from '@testing-library/react';

// Override `render` method.
export {
  render,
};
