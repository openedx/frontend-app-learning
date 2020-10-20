import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
  mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import { UserMessagesProvider } from './generic/user-messages';

import './index.scss';
import './assets/favicon.ico';
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

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={initializeStore()}>
      <UserMessagesProvider>
        <Switch>
          <Route path="/redirect" component={CoursewareRedirectLandingPage} />
          <Route path="/course/:courseId/home">
            <TabContainer tab="outline" fetch={fetchOutlineTab} slice="courseHome">
              <OutlineTab />
            </TabContainer>
          </Route>
          <Route path="/course/:courseId/dates">
            <TabContainer tab="dates" fetch={fetchDatesTab} slice="courseHome">
              <DatesTab />
            </TabContainer>
          </Route>
          <Route path="/course/:courseId/progress">
            <TabContainer tab="progress" fetch={fetchProgressTab} slice="courseHome">
              <ProgressTab />
            </TabContainer>
          </Route>
          <Route path="/course/:courseId/course-exit">
            <TabContainer tab="courseware" fetch={fetchCourse} slice="courseware">
              <CourseExit />
            </TabContainer>
          </Route>
          <Route
            path={[
              '/course/:courseId/:sequenceId/:unitId',
              '/course/:courseId/:sequenceId',
              '/course/:courseId',
            ]}
            component={CoursewareContainer}
          />
        </Switch>
        <Footer />
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
        INSIGHTS_BASE_URL: process.env.INSIGHTS_BASE_URL || null,
        STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
        SUPPORT_URL: process.env.SUPPORT_URL || null,
        TWITTER_URL: process.env.TWITTER_URL || null,
        ENTERPRISE_LEARNER_PORTAL_HOSTNAME: process.env.ENTERPRISE_LEARNER_PORTAL_HOSTNAME || null,
      }, 'LearnerAppConfig');
    },
  },
  // TODO: Remove this once the course blocks api supports unauthenticated
  // access and we are prepared to support public courses in this app.
  requireAuthenticatedUser: true,
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
  ],
});
