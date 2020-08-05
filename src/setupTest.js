import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
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
import { reducer as activeCourseReducer } from './course';
import { reducer as coursewareReducer } from './courseware/data/slice';
import { reducer as modelsReducer } from './generic/model-store';
import { UserMessagesProvider } from './generic/user-messages';

import appMessages from './i18n';
import { fetchCourse, fetchSequence } from './courseware/data';
import executeThunk from './utils';
import buildSimpleCourseAndSequenceMetadata from './courseware/data/__factories__/sequenceMetadata.factory';

class MockLoggingService {
  logInfo = jest.fn();

  logError = jest.fn();
}

export default function initializeMockApp() {
  mergeConfig({
    INSIGHTS_BASE_URL: process.env.INSIGHTS_BASE_URL || null,
    STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
    authenticatedUser: {
      userId: 'abc123',
      username: 'Mock User',
      roles: [],
      administrator: false,
    },
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

let globalStore;

export async function initializeTestStore(options = {}, overrideStore = true) {
  const store = configureStore({
    reducer: {
      models: modelsReducer,
      activeCourse: activeCourseReducer,
      courseware: coursewareReducer,
    },
  });
  if (overrideStore) {
    globalStore = store;
  }
  initializeMockApp();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.reset();

  const {
    courseBlocks, sequenceBlock, courseMetadata, sequenceMetadata,
  } = buildSimpleCourseAndSequenceMetadata(options);

  const forbiddenCourseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseMetadata.id}`;
  const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);

  axiosMock.onGet(forbiddenCourseUrl).reply(200, courseMetadata);
  axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
  sequenceMetadata.forEach(metadata => {
    const sequenceMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${metadata.item_id}`;
    axiosMock.onGet(sequenceMetadataUrl).reply(200, metadata);
  });

  axiosMock.onAny().reply((config) => {
    // eslint-disable-next-line no-console
    console.log(config.url);
    return [200, {}];
  });

  // eslint-disable-next-line no-unused-expressions
  !options.excludeFetchCourse && await executeThunk(fetchCourse(courseMetadata.id), store.dispatch);

  if (!options.excludeFetchSequence) {
    await Promise.all(sequenceBlock
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
