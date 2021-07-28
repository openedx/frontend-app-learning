import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';

import { Toast } from '@edx/paragon';
import { Header } from '../course-header';
import AccessDeniedRedirect from '../shared/access-denied-redirect';
import PageLoading from '../generic/PageLoading';

import genericMessages from '../generic/messages';
import messages from './messages';
import LoadedTabPage from './LoadedTabPage';
import { setCallToActionToast } from '../course-home/data/slice';

function TabPage({
  intl,
  courseId,
  courseStatus,
  metadataModel,
  unitId,
  ...passthroughProps
}) {
  const {
    toastBodyLink,
    toastBodyText,
    toastHeader,
  } = useSelector(state => state.courseHome);
  const dispatch = useDispatch();

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
      <>
        <Toast
          action={toastBodyText ? {
            label: toastBodyText,
            href: toastBodyLink,
          } : null}
          closeLabel={intl.formatMessage(genericMessages.close)}
          onClose={() => dispatch(setCallToActionToast({ header: '', link: null, link_text: null }))}
          show={!!(toastHeader)}
        >
          {toastHeader}
        </Toast>
        <LoadedTabPage courseId={courseId} metadataModel={metadataModel} unitId={unitId} {...passthroughProps} />
      </>
    );
  }

  if (courseStatus === 'denied') {
    return (
      <AccessDeniedRedirect
        courseId={courseId}
        metadataModel={metadataModel}
        unitId={unitId}
      />
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

TabPage.defaultProps = {
  unitId: null,
};

TabPage.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  courseStatus: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

export default injectIntl(TabPage);
