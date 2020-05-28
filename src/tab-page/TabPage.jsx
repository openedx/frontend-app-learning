import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import { Header } from '../course-header';
import { useLogistrationAlert } from '../alerts/logistration-alert';
import PageLoading from '../PageLoading';

import messages from './messages';
import LoadedTabPage from './LoadedTabPage';

function TabPage({
  intl,
  ...passthroughProps
}) {
  useLogistrationAlert();

  const courseStatus = useSelector(state => state.courseware.courseStatus);

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
};

export default injectIntl(TabPage);
