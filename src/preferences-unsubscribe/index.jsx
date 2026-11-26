import React, { useEffect, useState } from 'react';

import { Container, Icon, Hyperlink } from '@openedx/paragon';
import { CheckCircleLightOutline, ErrorOutline } from '@openedx/paragon/icons';
import { useParams } from 'react-router-dom';

import {
  FormattedMessage, getLinkProps, getUrlByRouteRole, logError, sendTrackEvent, useIntl,
} from '@openedx/frontend-base';

import {
  accountRole, LOADED, LOADING, FAILED,
} from '@src/constants';
import PageLoading from '../generic/PageLoading';
import { unsubscribeNotificationPreferences } from './data/api';
import messages from './messages';

const PreferencesUnsubscribe = () => {
  const intl = useIntl();
  const { userToken } = useParams();
  const [status, setStatus] = useState(LOADING);
  const accountUrl = getUrlByRouteRole(accountRole);

  useEffect(() => {
    unsubscribeNotificationPreferences(userToken).then(
      () => setStatus(LOADED),
      (error) => {
        setStatus(FAILED);
        logError(error);
      },
    );
    sendTrackEvent('edx.ui.lms.notifications.preferences.unsubscribe', { userToken });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageContent = {
    icon: CheckCircleLightOutline,
    iconClass: 'text-success',
    headingText: messages.unsubscribeSuccessHeading,
    bodyText: messages.unsubscribeSuccessMessage,
  };

  if (status === FAILED) {
    pageContent.icon = ErrorOutline;
    pageContent.iconClass = 'text-danger';
    pageContent.headingText = messages.unsubscribeFailedHeading;
    pageContent.bodyText = messages.unsubscribeFailedMessage;
  }

  return (
    <Container as="main" size="xs" className="mx-auto my-5">
      <div className="d-flex flex-row h-100">
        <div className="mx-auto my-auto">
          {status === LOADING && <PageLoading srMessage={`${intl.formatMessage(messages.unsubscribeLoading)}`} />}
          {status !== LOADING && (
            <>
              <Icon src={pageContent.icon} className={`size-56px mx-auto ${pageContent.iconClass}`} />
              <h3 className="font-weight-bold text-primary-500 text-center my-3" data-testid="heading-text">
                {intl.formatMessage(pageContent.headingText)}
              </h3>
              <div className="font-weight-normal text-gray-700 text-center">
                {intl.formatMessage(pageContent.bodyText)}
              </div>
              {accountUrl && (
                <small className="d-block font-weight-normal text-gray text-center mt-3">
                  <FormattedMessage
                    id="learning.notification.preferences.unsubscribe.preferenceCenterSuggestion"
                    description="Shown as a suggestion or recommendation for learner when their unsubscribing request has failed"
                    defaultMessage="Go to the {preferenceCenterUrl} to set your preferences"
                    values={{
                      preferenceCenterUrl: (
                        <Hyperlink {...getLinkProps(`${accountUrl.replace(/\/+$/, '')}/#notifications`)}>
                          {intl.formatMessage(messages.preferenceCenterUrl)}
                        </Hyperlink>
                      ),
                    }}
                  />
                </small>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default PreferencesUnsubscribe;
