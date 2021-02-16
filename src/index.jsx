import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
  mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage, PageRoute } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import { UserMessagesProvider } from './generic/user-messages';

import './index.scss';
import OutlineTab from './course-home/outline-tab';
import { CourseExit } from './courseware/course/course-exit';
import CoursewareContainer from './courseware';
import CoursewareRedirectLandingPage from './courseware/CoursewareRedirectLandingPage';
import DatesTab from './course-home/dates-tab';
import ProgressTab from './course-home/progress-tab/ProgressTab';
import { TabContainer } from './tab-page';

import { fetchDatesTab, fetchOutlineTab, fetchProgressTab } from './course-home/data';
import { fetchCourse } from './courseware/data';
import initializeStore from './store';
import NexBlockContainer from './nex-runtime/NexContainer';
import PluginTestPage from './plugin-test/PluginTestPage';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={initializeStore()}>
      <UserMessagesProvider>
        <Switch>
          <Route exact path="/nexblock" component={NexBlockContainer} />
          <Switch>
            <Route exact path="/plugin-test" component={PluginTestPage} />
            <PageRoute path="/redirect" component={CoursewareRedirectLandingPage} />
            <PageRoute path="/course/:courseId/home">
              <TabContainer tab="outline" fetch={fetchOutlineTab} slice="courseHome">
                <OutlineTab />
              </TabContainer>
            </PageRoute>
            <PageRoute path="/course/:courseId/dates">
              <TabContainer tab="dates" fetch={fetchDatesTab} slice="courseHome">
                <DatesTab />
              </TabContainer>
            </PageRoute>
            <PageRoute path="/course/:courseId/progress">
              <TabContainer tab="progress" fetch={fetchProgressTab} slice="courseHome">
                <ProgressTab />
              </TabContainer>
            </PageRoute>
            <PageRoute path="/course/:courseId/course-end">
              <TabContainer tab="courseware" fetch={fetchCourse} slice="courseware">
                <CourseExit />
              </TabContainer>
            </PageRoute>
            <PageRoute
              path={[
                '/course/:courseId/:sequenceId/:unitId',
                '/course/:courseId/:sequenceId',
                '/course/:courseId',
              ]}
              component={CoursewareContainer}
            />
          </Switch>
          <Footer />
        </Switch>
      </UserMessagesProvider>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        CREDENTIALS_BASE_URL: process.env.CREDENTIALS_BASE_URL || null,
        ENTERPRISE_LEARNER_PORTAL_HOSTNAME: process.env.ENTERPRISE_LEARNER_PORTAL_HOSTNAME || null,
        INSIGHTS_BASE_URL: process.env.INSIGHTS_BASE_URL || null,
        SEARCH_CATALOG_URL: process.env.SEARCH_CATALOG_URL || null,
        SOCIAL_UTM_MILESTONE_CAMPAIGN: process.env.SOCIAL_UTM_MILESTONE_CAMPAIGN || null,
        STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
        SUPPORT_URL: process.env.SUPPORT_URL || null,
        SUPPORT_URL_CALCULATOR_MATH: process.env.SUPPORT_URL_CALCULATOR_MATH || null,
        SUPPORT_URL_ID_VERIFICATION: process.env.SUPPORT_URL_ID_VERIFICATION || null,
        SUPPORT_URL_VERIFIED_CERTIFICATE: process.env.SUPPORT_URL_VERIFIED_CERTIFICATE || null,
        TWITTER_HASHTAG: process.env.TWITTER_HASHTAG || null,
        TWITTER_URL: process.env.TWITTER_URL || null,
        NEXBLOCK_API_PATH: process.env.NEXBLOCK_API_PATH || null,
      }, 'LearnerAppConfig');
    },
  },
  messages: [
    appMessages,
    footerMessages,
  ],
});
