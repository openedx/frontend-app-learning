import 'babel-polyfill';

import { APP_INIT_ERROR, APP_READY, subscribe, initialize } from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import ExamplePage from './example/ExamplePage';

import './index.scss';
import './assets/favicon.ico';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Header />
      <ExamplePage />
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
