import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
  mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage, PageRoute } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'react-router-dom';

import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as headerMessages } from '@edx/frontend-component-header';
import { fetchDiscussionTab, fetchLiveTab } from './course-home/data/thunks';
import DiscussionTab from './course-home/discussion-tab/DiscussionTab';

import appMessages from './i18n';
import { UserMessagesProvider } from './generic/user-messages';

import './index.scss';
import OutlineTab from './course-home/outline-tab';
import { CourseExit } from './courseware/course/course-exit';
import CoursewareContainer from './courseware';
import CoursewareRedirectLandingPage from './courseware/CoursewareRedirectLandingPage';
import DatesTab from './course-home/dates-tab';
import GoalUnsubscribe from './course-home/goal-unsubscribe';
import ProgressTab from './course-home/progress-tab/ProgressTab';
import { TabContainer } from './tab-page';

import { fetchDatesTab, fetchOutlineTab, fetchProgressTab } from './course-home/data';
import { fetchCourse } from './courseware/data';
import initializeStore from './store';
import NoticesProvider from './generic/notices';
import PathFixesProvider from './generic/path-fixes';
import LiveTab from './course-home/live-tab/LiveTab';
import CourseAccessErrorPage from './generic/CourseAccessErrorPage';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={initializeStore()}>
      <PathFixesProvider>
        <NoticesProvider>
          <UserMessagesProvider>
            <Switch>
              <PageRoute exact path="/goal-unsubscribe/:token" component={GoalUnsubscribe} />
              <PageRoute path="/redirect" component={CoursewareRedirectLandingPage} />
              <PageRoute path="/course/:courseId/access-denied" component={CourseAccessErrorPage} />
              <PageRoute path="/course/:courseId/home">
                <TabContainer tab="outline" fetch={fetchOutlineTab} slice="courseHome">
                  <OutlineTab />
                </TabContainer>
              </PageRoute>
              <PageRoute path="/course/:courseId/live">
                <TabContainer tab="live" fetch={fetchLiveTab} slice="courseHome">
                  <LiveTab />
                </TabContainer>
              </PageRoute>
              <PageRoute path="/course/:courseId/dates">
                <TabContainer tab="dates" fetch={fetchDatesTab} slice="courseHome">
                  <DatesTab />
                </TabContainer>
              </PageRoute>
              <PageRoute path="/course/:courseId/discussion/:path*">
                <TabContainer tab="discussion" fetch={fetchDiscussionTab} slice="courseHome">
                  <DiscussionTab />
                </TabContainer>
              </PageRoute>
              <PageRoute
                path={[
                  '/course/:courseId/progress/:targetUserId/',
                  '/course/:courseId/progress',
                ]}
                render={({ match }) => (
                  <TabContainer
                    tab="progress"
                    fetch={(courseId) => fetchProgressTab(courseId, match.params.targetUserId)}
                    slice="courseHome"
                  >
                    <ProgressTab />
                  </TabContainer>
                )}
              />
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
          </UserMessagesProvider>
        </NoticesProvider>
      </PathFixesProvider>
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
        CONTACT_URL: process.env.CONTACT_URL || null,
        CREDENTIALS_BASE_URL: process.env.CREDENTIALS_BASE_URL || null,
        CREDIT_HELP_LINK_URL: process.env.CREDIT_HELP_LINK_URL || null,
        DISCUSSIONS_MFE_BASE_URL: process.env.DISCUSSIONS_MFE_BASE_URL || null,
        ENTERPRISE_LEARNER_PORTAL_HOSTNAME: process.env.ENTERPRISE_LEARNER_PORTAL_HOSTNAME || null,
        ENABLE_JUMPNAV: process.env.ENABLE_JUMPNAV || null,
        ENABLE_NOTICES: process.env.ENABLE_NOTICES || null,
        INSIGHTS_BASE_URL: process.env.INSIGHTS_BASE_URL || null,
        SEARCH_CATALOG_URL: process.env.SEARCH_CATALOG_URL || null,
        SOCIAL_UTM_MILESTONE_CAMPAIGN: process.env.SOCIAL_UTM_MILESTONE_CAMPAIGN || null,
        STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
        SUPPORT_URL: process.env.SUPPORT_URL || null,
        SUPPORT_URL_CALCULATOR_MATH: process.env.SUPPORT_URL_CALCULATOR_MATH || null,
        SUPPORT_URL_ID_VERIFICATION: process.env.SUPPORT_URL_ID_VERIFICATION || null,
        SUPPORT_URL_VERIFIED_CERTIFICATE: process.env.SUPPORT_URL_VERIFIED_CERTIFICATE || null,
        TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL || null,
        TWITTER_HASHTAG: process.env.TWITTER_HASHTAG || null,
        TWITTER_URL: process.env.TWITTER_URL || null,
        LEGACY_THEME_NAME: process.env.LEGACY_THEME_NAME || null,
      }, 'LearnerAppConfig');
    },
  },
  messages: [
    appMessages,
    footerMessages,
    headerMessages,
  ],
});
