import React, { Component } from 'react';
import { connect, Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { IntlProvider, injectIntl, intlShape } from 'react-intl';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { sendTrackEvent } from '@edx/frontend-analytics';
import SiteHeader from '@edx/frontend-component-site-header';
import SiteFooter from '@edx/frontend-component-footer';
import { getLocale, getMessages } from '@edx/frontend-i18n'; // eslint-disable-line

import { PageLoading, fetchUserAccount } from '../common';
import { ConnectedLearningSequencePage } from '../learning-sequence';

import FooterLogo from '../assets/edx-footer.png';
import HeaderLogo from '../assets/logo.svg';
import ErrorPage from './ErrorPage';
import NotFoundPage from './NotFoundPage';

import messages from './App.messages';


function PageContent({
  ready,
  configuration,
  username,
  avatar,
  intl,
}) {
  if (!ready) {
    return <PageLoading srMessage={intl.formatMessage(messages['app.loading.message'])} />;
  }

  const mainMenu = [
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/dashboard`,
      content: intl.formatMessage(messages['siteheader.links.wtf']),
    },
  ];
  const userMenu = [
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}`,
      content: intl.formatMessage(messages['siteheader.user.menu.dashboard']),
    },
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/u/${username}`,
      content: intl.formatMessage(messages['siteheader.user.menu.profile']),
    },
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/account/settings`,
      content: intl.formatMessage(messages['siteheader.user.menu.account.settings']),
    },
    {
      type: 'item',
      href: process.env.ORDER_HISTORY_URL,
      content: intl.formatMessage(messages['siteheader.user.menu.order.history']),
    },
    {
      type: 'item',
      href: process.env.LOGOUT_URL,
      content: intl.formatMessage(messages['siteheader.user.menu.logout']),
    },
  ];
  const loggedOutItems = [
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/login`,
      content: intl.formatMessage(messages['siteheader.user.menu.login']),
    },
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/register`,
      content: intl.formatMessage(messages['siteheader.user.menu.register']),
    },
  ];

  return (
    <div id="app">
      <SiteHeader
        logo={HeaderLogo}
        loggedIn
        username={username}
        avatar={avatar}
        logoAltText={configuration.SITE_NAME}
        logoDestination={configuration.MARKETING_SITE_BASE_URL}
        mainMenu={mainMenu}
        userMenu={userMenu}
        loggedOutItems={loggedOutItems}
      />
      <main>
        <Switch>
          <Route path="/course/:courseRunId/:sequenceBlockId" component={ConnectedLearningSequencePage} />
          <Route path="/error" component={ErrorPage} />
          <Route path="/notfound" component={NotFoundPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </main>
      <SiteFooter
        siteName={configuration.SITE_NAME}
        siteLogo={FooterLogo}
        marketingSiteBaseUrl={configuration.MARKETING_SITE_BASE_URL}
        supportUrl={configuration.SUPPORT_URL}
        contactUrl={configuration.CONTACT_URL}
        openSourceUrl={configuration.OPEN_SOURCE_URL}
        termsOfServiceUrl={configuration.TERMS_OF_SERVICE_URL}
        privacyPolicyUrl={configuration.PRIVACY_POLICY_URL}
        facebookUrl={configuration.FACEBOOK_URL}
        twitterUrl={configuration.TWITTER_URL}
        youTubeUrl={configuration.YOU_TUBE_URL}
        linkedInUrl={configuration.LINKED_IN_URL}
        googlePlusUrl={configuration.GOOGLE_PLUS_URL}
        redditUrl={configuration.REDDIT_URL}
        appleAppStoreUrl={configuration.APPLE_APP_STORE_URL}
        googlePlayUrl={configuration.GOOGLE_PLAY_URL}
        handleAllTrackEvents={sendTrackEvent}
      />
    </div>
  );
}

PageContent.propTypes = {
  username: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  ready: PropTypes.bool,
  configuration: PropTypes.shape({
    SITE_NAME: PropTypes.string.isRequired,
    MARKETING_SITE_BASE_URL: PropTypes.string.isRequired,
    SUPPORT_URL: PropTypes.string.isRequired,
    CONTACT_URL: PropTypes.string.isRequired,
    OPEN_SOURCE_URL: PropTypes.string.isRequired,
    TERMS_OF_SERVICE_URL: PropTypes.string.isRequired,
    PRIVACY_POLICY_URL: PropTypes.string.isRequired,
    FACEBOOK_URL: PropTypes.string.isRequired,
    TWITTER_URL: PropTypes.string.isRequired,
    YOU_TUBE_URL: PropTypes.string.isRequired,
    LINKED_IN_URL: PropTypes.string.isRequired,
    GOOGLE_PLUS_URL: PropTypes.string.isRequired,
    REDDIT_URL: PropTypes.string.isRequired,
    APPLE_APP_STORE_URL: PropTypes.string.isRequired,
    GOOGLE_PLAY_URL: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

PageContent.defaultProps = {
  ready: false,
  avatar: null,
};

const IntlPageContent = injectIntl(PageContent);

class App extends Component {
  componentDidMount() {
    const { username } = this.props;
    this.props.fetchUserAccount(username);
  }

  render() {
    return (
      <IntlProvider locale={getLocale()} messages={getMessages()}>
        <Provider store={this.props.store}>
          <ConnectedRouter history={this.props.history}>
            <IntlPageContent
              ready={this.props.ready}
              configuration={this.props.configuration}
              username={this.props.username}
              avatar={this.props.avatar}
            />
          </ConnectedRouter>
        </Provider>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  fetchUserAccount: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  store: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
  ready: PropTypes.bool,
  configuration: PropTypes.shape({
    SITE_NAME: PropTypes.string.isRequired,
    MARKETING_SITE_BASE_URL: PropTypes.string.isRequired,
    SUPPORT_URL: PropTypes.string.isRequired,
    CONTACT_URL: PropTypes.string.isRequired,
    OPEN_SOURCE_URL: PropTypes.string.isRequired,
    TERMS_OF_SERVICE_URL: PropTypes.string.isRequired,
    PRIVACY_POLICY_URL: PropTypes.string.isRequired,
    FACEBOOK_URL: PropTypes.string.isRequired,
    TWITTER_URL: PropTypes.string.isRequired,
    YOU_TUBE_URL: PropTypes.string.isRequired,
    LINKED_IN_URL: PropTypes.string.isRequired,
    GOOGLE_PLUS_URL: PropTypes.string.isRequired,
    REDDIT_URL: PropTypes.string.isRequired,
    APPLE_APP_STORE_URL: PropTypes.string.isRequired,
    GOOGLE_PLAY_URL: PropTypes.string.isRequired,
  }).isRequired,
};

App.defaultProps = {
  ready: false,
  avatar: null,
};

const mapStateToProps = state => ({
  username: state.authentication.username,
  // An error means that we tried to load the user account and failed,
  // which also means we're ready to display something.
  ready: state.userAccount.loaded || state.userAccount.error != null,
  configuration: state.configuration,
  avatar: state.userAccount.profileImage.hasImage
    ? state.userAccount.profileImage.imageUrlMedium
    : null,
});

export default connect(
  mapStateToProps,
  {
    fetchUserAccount,
  },
)(App);
