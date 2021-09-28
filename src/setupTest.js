import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import 'jest-chain';
import './courseware/data/__factories__';
import './course-home/data/__factories__';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { configure as configureI18n } from '@edx/frontend-platform/i18n';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import { configure as configureAuth, getAuthenticatedHttpClient, MockAuthService } from '@edx/frontend-platform/auth';
import React from 'react';
import PropTypes from 'prop-types';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from 'react-intl';
import MockAdapter from 'axios-mock-adapter';
import AppProvider from '@edx/frontend-platform/react/AppProvider';
import { reducer as courseHomeReducer } from './course-home/data';
import { reducer as coursewareReducer } from './courseware/data/slice';
import { reducer as modelsReducer } from './generic/model-store';
import { UserMessagesProvider } from './generic/user-messages';

import appMessages from './i18n';
import { fetchCourse, fetchSequence } from './courseware/data';
import { appendBrowserTimezoneToUrl, executeThunk } from './utils';
import buildSimpleCourseAndSequenceMetadata from './courseware/data/__factories__/sequenceMetadata.factory';

class MockLoggingService {
  logInfo = jest.fn();

  logError = jest.fn();
}

window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(),
}));

// Mock Intersection Observer which is unavailable in the context of a test.
global.IntersectionObserver = jest.fn(function mockIntersectionObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

// Mock media queries because any component that uses `react-break` for responsive breakpoints will
// run into `TypeError: window.matchMedia is not a function`. This avoids that for all of our tests now.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => {
    // Returns true given a mediaQuery for a screen size greater than 768px (this exact query is what react-break sends)
    // Without this, if we hardcode `matches` to either true or false, either all or none of the breakpoints match,
    // respectively.
    const matches = !!(query === 'screen and (min-width: 768px)');
    return {
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  }),
});

export const authenticatedUser = {
  userId: 'abc123',
  username: 'Mock User',
  roles: [],
  administrator: false,
};

export function initializeMockApp() {
  mergeConfig({
    CONTACT_URL: process.env.CONTACT_URL || null,
    INSIGHTS_BASE_URL: process.env.INSIGHTS_BASE_URL || null,
    STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
    TWITTER_URL: process.env.TWITTER_URL || null,
    authenticatedUser: {
      userId: 'abc123',
      username: 'Mock User',
      roles: [],
      administrator: false,
    },
    SUPPORT_URL_ID_VERIFICATION: 'http://example.com',
  });

  const loggingService = configureLogging(MockLoggingService, {
    config: getConfig(),
  });
  const authService = configureAuth(MockAuthService, {
    config: getConfig(),
    loggingService,
  });

  // i18n doesn't have a service class to return.
  configureI18n({
    config: getConfig(),
    loggingService,
    messages: [appMessages],
  });

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
    },
  });
  if (overrideStore) {
    globalStore = store;
  }
  initializeMockApp();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.reset();

  const {
    courseBlocks, sequenceBlocks, courseMetadata, sequenceMetadata,
  } = buildSimpleCourseAndSequenceMetadata(options);

  let forbiddenCourseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseMetadata.id}`;
  forbiddenCourseUrl = appendBrowserTimezoneToUrl(forbiddenCourseUrl);

  const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);
  const learningSequencesUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/*`);

  axiosMock.onGet(forbiddenCourseUrl).reply(200, courseMetadata);
  axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
  axiosMock.onGet(learningSequencesUrlRegExp).reply(403, {});
  sequenceMetadata.forEach(metadata => {
    const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${metadata.item_id}`;
    axiosMock.onGet(sequenceMetadataUrl).reply(200, metadata);
    const proctoredExamApiUrl = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${courseMetadata.id}/content_id/${sequenceMetadata.item_id}?is_learning_mfe=true`;
    axiosMock.onGet(proctoredExamApiUrl).reply(200, { exam: {}, active_attempt: {} });
  });

  logUnhandledRequests(axiosMock);

  // eslint-disable-next-line no-unused-expressions
  !options.excludeFetchCourse && await executeThunk(fetchCourse(courseMetadata.id), store.dispatch);

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
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <IntlProvider locale="en">
        <AppProvider store={store || globalStore}>
          <UserMessagesProvider>
            {children}
          </UserMessagesProvider>
        </AppProvider>
      </IntlProvider>
    );
  }

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
