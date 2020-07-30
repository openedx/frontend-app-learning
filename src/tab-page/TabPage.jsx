import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Header } from '../course-header';
import PageLoading from '../generic/PageLoading';

import messages from './messages';
import LoadedTabPage from './LoadedTabPage';

function TabPage({
  intl,
  courseStatus,
  ...passthroughProps
}) {
  if (courseStatus === 'loading') {
    return (
      <>
        <Header />
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
      </>
    );
  }

  if (courseStatus === 'loaded') {
    return (
      <LoadedTabPage {...passthroughProps} />
    );
  }

  // courseStatus 'failed' and any other unexpected course status.
  return (
    <>
      <Header />
      <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
        {intl.formatMessage(messages.failure)}
      </p>
    </>
  );
}

TabPage.propTypes = {
  intl: intlShape.isRequired,
  courseStatus: PropTypes.string.isRequired,
};

export default injectIntl(TabPage);
