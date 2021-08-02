import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';

import { Toast } from '@edx/paragon';
import { Header } from '../course-header';
import { getAccessDeniedRedirectUrl } from '../shared/access';
import PageLoading from '../generic/PageLoading';
import { useModel } from '../generic/model-store';

import genericMessages from '../generic/messages';
import messages from './messages';
import LoadedTabPage from './LoadedTabPage';
import { setCallToActionToast } from '../course-home/data/slice';

function TabPage({ intl, ...props }) {
  const {
    activeTabSlug,
    courseId,
    courseStatus,
    metadataModel,
    unitId,
  } = props;
  const {
    toastBodyLink,
    toastBodyText,
    toastHeader,
  } = useSelector(state => state.courseHome);
  const dispatch = useDispatch();
  const {
    courseAccess,
    start,
  } = useModel(metadataModel, courseId);

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

  if (courseStatus === 'denied') {
    const redirectUrl = getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess, start, unitId);
    if (redirectUrl) {
      return (<Redirect to={redirectUrl} />);
    }
  }

  // Either a success state or a denied state that wasn't redirected above (some tabs handle denied states themselves,
  // like the outline tab handling unenrolled learners)
  if (courseStatus === 'loaded' || courseStatus === 'denied') {
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
        <LoadedTabPage {...props} />
      </>
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
  courseId: null,
  unitId: null,
};

TabPage.propTypes = {
  activeTabSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string,
  courseStatus: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

export default injectIntl(TabPage);
