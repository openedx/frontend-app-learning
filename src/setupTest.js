import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import './courseware/data/__factories__';
import './course-home/data/__factories__';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { configure as configureI18n, IntlProvider } from '@edx/frontend-platform/i18n';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import { configure as configureAuth, getAuthenticatedHttpClient, MockAuthService } from '@edx/frontend-platform/auth';
import React from 'react';
import PropTypes from 'prop-types';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import { reducer as learningAssistantReducer } from '@edx/frontend-lib-learning-assistant';
import { reducer as specialExamsReducer } from '@edx/frontend-lib-special-exams';
import { AppProvider } from '@edx/frontend-platform/react';
import { reducer as courseHomeReducer } from './course-home/data';
import { reducer as coursewareReducer } from './courseware/data/slice';
import { reducer as recommendationsReducer } from './courseware/course/course-exit/data/slice';
import { reducer as toursReducer } from './product-tours/data';
import { reducer as modelsReducer } from './generic/model-store';
import { UserMessagesProvider } from './generic/user-messages';

import messages from './i18n';
import { fetchCourse, fetchSequence } from './courseware/data';
import { getCourseOutlineStructure } from './courseware/data/thunks';
import { appendBrowserTimezoneToUrl, executeThunk } from './utils';
import buildSimpleCourseAndSequenceMetadata from './courseware/data/__factories__/sequenceMetadata.factory';
import { buildOutlineFromBlocks } from './courseware/data/__factories__/learningSequencesOutline.factory';
import MockedPluginSlot from './tests/MockedPluginSlot';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  ...jest.requireActual('@openedx/frontend-plugin-framework'),
  Plugin: () => 'Plugin',
  PluginSlot: MockedPluginSlot,
}));

jest.mock('@src/generic/plugin-store', () => ({
  ...jest.requireActual('@src/generic/plugin-store'),
  usePluginsCallback: jest.fn((_, cb) => cb),
}));

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

let globalStore;

export async function initializeTestStore(options = {}, overrideStore = true) {
  const store = configureStore({
    reducer: {
      models: modelsReducer,
      courseware: coursewareReducer,
      courseHome: courseHomeReducer,
      learningAssistant: learningAssistantReducer,
      specialExams: specialExamsReducer,
      recommendations: recommendationsReducer,
      tours: toursReducer,
    },
  });
  if (overrideStore) {
    globalStore = store;
  }
  initializeMockApp();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.reset();

  const {
    courseBlocks, sequenceBlocks, unitBlocks, courseMetadata, sequenceMetadata, courseHomeMetadata,
  } = buildSimpleCourseAndSequenceMetadata(options);

  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseMetadata.id}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  const learningSequencesUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/*`);
  let courseHomeMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseMetadata.id}`;
  const discussionConfigUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/*`);
  const coursewareSidebarSettingsUrl = `${getConfig().LMS_BASE_URL}/courses/${courseMetadata.id}/courseware-navigation-sidebar/toggles/`;
  const outlineSidebarUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/navigation/${courseMetadata.id}`;
  courseHomeMetadataUrl = appendBrowserTimezoneToUrl(courseHomeMetadataUrl);

  const provider = options?.provider || 'legacy';
  const enableNavigationSidebar = options.enableNavigationSidebar || { enable_navigation_sidebar: true };
  const alwaysOpenAuxiliarySidebar = options.alwaysOpenAuxiliarySidebar || { always_open_auxiliary_sidebar: true };

  axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
  axiosMock.onGet(learningSequencesUrlRegExp).reply(200, buildOutlineFromBlocks(courseBlocks));
  axiosMock.onGet(discussionConfigUrl).reply(200, { provider });
  axiosMock.onGet(coursewareSidebarSettingsUrl).reply(200, {
    ...enableNavigationSidebar,
    ...alwaysOpenAuxiliarySidebar,
  });

  axiosMock.onGet(outlineSidebarUrl).reply(200, {
    ...courseBlocks,
    ...sequenceBlocks,
    ...unitBlocks,
  });

  sequenceMetadata.forEach(metadata => {
    const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${metadata.item_id}`;
    axiosMock.onGet(sequenceMetadataUrl).reply(200, metadata);
    const proctoredExamApiUrl = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${courseMetadata.id}/content_id/${sequenceMetadata.item_id}?is_learning_mfe=true`;
    axiosMock.onGet(proctoredExamApiUrl).reply(200, { exam: {}, active_attempt: {} });
  });

  logUnhandledRequests(axiosMock);

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  !options.excludeFetchCourse && await executeThunk(fetchCourse(courseMetadata.id), store.dispatch);

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  !options.excludeFetchOutlineSidebar && await executeThunk(
    getCourseOutlineStructure(courseMetadata.id),
    store.dispatch,
  );

  if (!options.excludeFetchSequence) {
    await Promise.all(sequenceBlocks
      .map(block => executeThunk(fetchSequence(block.id), store.dispatch)));
  }

  return store;
}

function render(
  ui,
  {
    store = null,
    wrapWithRouter = false,
    ...renderOptions
  } = {},
) {
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <IntlProvider locale="en">
      <AppProvider store={store || globalStore} wrapWithRouter={wrapWithRouter}>
        <UserMessagesProvider>
          {children}
        </UserMessagesProvider>
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
