import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { configure as configureI18n } from '@edx/frontend-platform/i18n';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import { configure as configureAuth, MockAuthService } from '@edx/frontend-platform/auth';
import React from 'react';
import PropTypes from 'prop-types';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from 'react-intl';
import { reducer as courseHomeReducer } from './course-home/data';
import { reducer as coursewareReducer } from './courseware/data/slice';
import { reducer as modelsReducer } from './generic/model-store';
import { UserMessagesProvider } from './generic/user-messages';

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

// Send MessageEvent indicating that a unit has been loaded.
function loadUnit(message = messageEvent) {
  window.postMessage(message, '*');
}

function render(
  ui,
  {
    initialState = baseInitialState,
    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
        courseHome: courseHomeReducer,
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

// Re-export everything.
export * from '@testing-library/react';

// Override `render` method; export `screen` too to suppress errors.
export {
  render, testUnits, baseInitialState as initialState, messageEvent, loadUnit,
};
