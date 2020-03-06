import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, Link } from 'react-router-dom';

import { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import UserMessagesProvider from './user-messages/UserMessagesProvider';

import './index.scss';
import './assets/favicon.ico';
import CourseContainer from './courseware/CourseContainer';
import OutlineContainer from './outline/OutlineContainer';

import store from './store';

function courseLinks() {
  // TODO: We should remove these links before we go live for learners.
  return (
    <main className="m-3">
      <ul>
        <li><Link to="/course/course-v1:edX+DemoX+Demo_Course">Visit Demo Course</Link></li>
        <li><Link to="/course/course-v1:UBCx+Water201x_2+2T2015">Visit Staging Course</Link></li>
      </ul>
    </main>
  );
}

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <UserMessagesProvider>
        <Switch>
          <Route exact path="/" render={courseLinks} />
          <Route path="/outline/:courseUsageKey" component={OutlineContainer} />
          <Route
            path={[
              '/course/:courseUsageKey/:sequenceId/:unitId',
              '/course/:courseUsageKey/:sequenceId',
              '/course/:courseUsageKey',
            ]}
            component={CourseContainer}
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
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
  ],
});
