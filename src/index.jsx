import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { identifyAuthenticatedUser, sendPageEvent, configureAnalytics, initializeSegment } from '@edx/frontend-analytics';
import LoggingService from '@edx/frontend-logging';
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

import { configuration } from './environment';
import { handleRtl } from './i18n/i18n-loader';
import configureStore from './store';
import { configureUserAccountApiService } from './common';
import { configureApiService as configureLmsApiService } from './learning-sequence';

import './index.scss';
import App from './components/App';

const apiClient = getAuthenticatedAPIClient({
  appBaseUrl: configuration.BASE_URL,
  authBaseUrl: configuration.LMS_BASE_URL,
  loginUrl: configuration.LOGIN_URL,
  logoutUrl: configuration.LOGOUT_URL,
  csrfTokenApiPath: configuration.CSRF_TOKEN_API_PATH,
  refreshAccessTokenEndpoint: configuration.REFRESH_ACCESS_TOKEN_ENDPOINT,
  accessTokenCookieName: configuration.ACCESS_TOKEN_COOKIE_NAME,
  userInfoCookieName: configuration.USER_INFO_COOKIE_NAME,
  csrfCookieName: configuration.CSRF_COOKIE_NAME,
});

/**
 * We need to merge the application configuration with the authentication state
 * so that we can hand it all to the redux store's initializer.
 */
function createInitialState() {
  return Object.assign({}, { configuration }, apiClient.getAuthenticationState());
}

function configure() {
  const { store, history } = configureStore(createInitialState(), configuration.ENVIRONMENT);

  configureLmsApiService(configuration, apiClient);
  configureUserAccountApiService(configuration, apiClient);
  initializeSegment(configuration.SEGMENT_KEY);
  configureAnalytics({
    loggingService: LoggingService,
    authApiClient: apiClient,
    analyticsApiBaseUrl: configuration.LMS_BASE_URL,
  });

  if (configuration.ENVIRONMENT === 'production') {
    handleRtl();
  }

  return {
    store,
    history,
  };
}

apiClient.ensurePublicOrAuthenticationAndCookies(
  window.location.pathname,
  () => {
    const { store, history } = configure();

    ReactDOM.render(<App store={store} history={history} />, document.getElementById('root'));

    identifyAuthenticatedUser();
    sendPageEvent();
  },
);

