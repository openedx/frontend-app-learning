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
import CoursewareContainer from './courseware';
import CoursewareRedirect from './CoursewareRedirect';
import DatesTab from './course-home/dates-tab';
import ProgressTab from './course-home/progress-tab/ProgressTab';
import { TabContainer } from './tab-page';

import store from './store';
import { fetchDatesTab, fetchOutlineTab, fetchProgressTab } from './course-home/data';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <UserMessagesProvider>
        <Switch>
          <Route path="/redirect" component={CoursewareRedirect} />
          <Route path="/course/:courseId/home">
            <TabContainer tab="outline" fetch={fetchOutlineTab}>
              <OutlineTab />
            </TabContainer>
          </Route>
          <Route path="/course/:courseId/dates">
            <TabContainer tab="dates" fetch={fetchDatesTab}>
              <DatesTab />
            </TabContainer>
          </Route>
          <Route path="/course/:courseId/progress">
            <TabContainer tab="progress" fetch={fetchProgressTab}>
              <ProgressTab />
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
        TWITTER_URL: process.env.TWITTER_URL || null,
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
