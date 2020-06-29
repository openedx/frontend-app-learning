import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { configure as configureI18n } from '@edx/frontend-platform/i18n';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import { configure as configureAuth, MockAuthService } from '@edx/frontend-platform/auth';

import appMessages from './i18n';

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

import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render as rtlRender, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';
import { reducer as modelsReducer } from './model-store';
import { reducer as coursewareReducer } from './data';
import { UserMessagesProvider } from './user-messages';

/**
 * HACK: Mock the MutationObserver as it's breaking async testing.
 *  According to StackOverflow it should be fixed in `jest-environment-jsdom` v16,
 *  but upgrading `jest` to v26 didn't fix this problem.
 *  ref: https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor
 */
global.MutationObserver = class {
  // eslint-disable-next-line no-unused-vars,no-useless-constructor,no-empty-function
  constructor(callback) {}

  disconnect() {}

  // eslint-disable-next-line no-unused-vars
  observe(element, initObject) {}
};

window.scrollTo = jest.fn();

// Generated units for convenience.
const testUnits = [...Array(10).keys()].map(i => String(i + 1));

// Base state containing various use-cases.
const baseInitialState = {
  courseware: {
    sequenceStatus: 'loaded',
    courseStatus: 'loaded',
    courseId: '1',
  },
  models: {
    courses: {
      1: {
        sectionIds: ['1'],
        contentTypeGatingEnabled: true,
      },
    },
    sections: {
      1: {
        sequenceIds: ['1', '2'],
      },
    },
    sequences: {
      1: {
        unitIds: testUnits,
        showCompletion: true,
        title: 'test-sequence',
        gatedContent: {
          gated: false,
          prereqId: '1',
          gatedSectionName: 'test-gated-section',
        },
      },
      2: {
        unitIds: testUnits,
        showCompletion: true,
        title: 'test-sequence-2',
      },
      3: {
        unitIds: testUnits,
        showCompletion: true,
        title: 'test-sequence-3',
        bannerText: 'test-banner-3',
        gatedContent: {
          gated: true,
          prereqId: '1',
          gatedSectionName: 'test-gated-section',
        },
      },
    },
    units: testUnits.reduce(
      (acc, unitId) => Object.assign(acc, {
        [unitId]: {
          id: unitId,
          contentType: 'other',
          title: unitId,
        },
      }),
      {},
    ),
  },
};

// MessageEvent used for indicating that a unit has been loaded.
const messageEvent = {
  type: 'plugin.resize',
  payload: {
    height: 300,
  },
};

function render(
  ui,
  {
    initialState = baseInitialState,
    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
      },
      preloadedState: initialState,
    }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <IntlProvider locale="en">
        <Provider store={store}>
          <UserMessagesProvider>
            {children}
          </UserMessagesProvider>
        </Provider>
      </IntlProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

// override `render` method; export `screen` too to suppress errors
export {
  render, screen, testUnits, baseInitialState as initialState, messageEvent,
};
