import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@edx/frontend-component-header';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Icon, Spinner } from '@openedx/paragon';
import { CheckCircleLightOutline, ErrorOutline } from '@openedx/paragon/icons';
import { updateNotificationPreferencesFromPatch } from './data/api';
import messages from './messages';
import { RequestStatus } from '../constants';

const NotificationPreferencesUnsubscribe = () => {
  const intl = useIntl();
  const { userToken, updatePatch } = useParams();
  const [progress, setProgress] = useState(RequestStatus.IN_PROGRESS);

  useEffect(() => {
    const sendRequest = async () => {
      try {
        await updateNotificationPreferencesFromPatch(userToken, updatePatch);
        setProgress(RequestStatus.SUCCESSFUL);
      } catch (errors) {
        setProgress(RequestStatus.FAILED);
      }
    };
    sendRequest();
  }, []);

  const preferencesUrl = `${getConfig().ACCOUNT_SETTINGS_URL}/notifications`;
  const pageContent = {
    icon: '',
    iconClass: '',
    headingText: '',
    bodyText: '',
  };
  if (progress === RequestStatus.SUCCESSFUL) {
    pageContent.icon = CheckCircleLightOutline;
    pageContent.iconClass = 'text-success';
    pageContent.headingText = messages.unsubscribeSuccessHeading;
    pageContent.bodyText = messages.unsubscribeSuccessMessage;
  } else if (progress === RequestStatus.FAILED) {
    pageContent.icon = ErrorOutline;
    pageContent.iconClass = 'text-danger';
    pageContent.headingText = messages.unsubscribeFailedHeading;
    pageContent.bodyText = messages.unsubscribeFailedMessage;
  }
  return (
    <div style={{ height: '100vh' }}>
      <Header />
      <Container size="xs" className="h-75 mx-auto my-auto">
        <div className="d-flex flex-row h-100">
          <div className="mx-auto my-auto">
            {progress === RequestStatus.IN_PROGRESS && (
              <Spinner animation="border" variant="primary" className="size-4r" />
            )}
            {[RequestStatus.SUCCESSFUL, RequestStatus.FAILED].includes(progress) && (
              <>
                <Icon
                  src={pageContent.icon}
                  className={`size-56px mx-auto ${pageContent.iconClass}`}
                />
                <h3 className="font-weight-bold text-primary-500 text-center my-3" data-testid="heading-text">
                  {intl.formatMessage(pageContent.headingText)}
                </h3>
                <div className="font-weight-normal text-gray-700 text-center">
                  {intl.formatMessage(pageContent.bodyText)}
                </div>
                <small className="d-block font-weight-normal text-gray text-center mt-3">
                  {intl.formatMessage(messages.preferencePagePreText)}
                  <a href={preferencesUrl}>
                    {intl.formatMessage(messages.preferencePageUrlText)}
                  </a>
                  {intl.formatMessage(messages.preferencePagePostText)}
                </small>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotificationPreferencesUnsubscribe;
