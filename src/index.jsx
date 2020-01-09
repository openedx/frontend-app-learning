import 'babel-polyfill';

import { APP_INIT_ERROR, APP_READY, subscribe, initialize } from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, Link } from 'react-router-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import CourseTabsNavigation from './CourseTabsNavigation';
import LearningSequencePage from './learning-sequence/LearningSequencePage';

import './index.scss';
import './assets/favicon.ico';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Header />
      <div className="container pt-2">
        <CourseTabsNavigation activeTabSlug="course" />
      </div>
      <Switch>
        {/* Staging: course-v1:UBCx+Water201x_2+2T2015 */}
        <Route
          exact
          path="/"

          render={() => <Link to="/course/course-v1%3AedX%2BDemoX%2BDemo_Course/block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction/block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc">Visit Demo Course</Link>}
        />
        <Route path="/course/:courseId/:subSectionId/:unitId" component={LearningSequencePage} />
        <Route path="/course/:courseId" component={LearningSequencePage} />
      </Switch>
      <Footer />
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
