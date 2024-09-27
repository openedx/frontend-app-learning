import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { ErrorPage } from '@edx/frontend-platform/react';
import { StrictDict } from '@edx/react-unit-test-utils';
import {
  ModalDialog, Modal, Icon, PageBanner,
} from '@openedx/paragon';

import PageLoading from '@src/generic/PageLoading';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { WarningFilled } from '@openedx/paragon/icons';
import * as hooks from './hooks';

/**
 * Feature policy for iframe, allowing access to certain courseware-related media.
 *
 * We must use the wildcard (*) origin for each feature, as courseware content
 * may be embedded in external iframes. Notably, xblock-lti-consumer is a popular
 * block that iframes external course content.

 * This policy was selected in conference with the edX Security Working Group.
 * Changes to it should be vetted by them (security@edx.org).
 */
export const IFRAME_FEATURE_POLICY = (
  'microphone *; camera *; midi *; geolocation *; encrypted-media *, clipboard-write *'
);

export const testIDs = StrictDict({
  contentIFrame: 'content-iframe-test-id',
  modalIFrame: 'modal-iframe-test-id',
});

const IFrameComponent = ({
  url, shouldShowContent, hasLoaded, loadingMessage, showError, title, contentIFrameProps,
}) => {
  const [httpStatusCode, setHttpStatusCode] = useState(500);
  useEffect(() => {
    getAuthenticatedHttpClient().get(url).then(res => {
      setHttpStatusCode(res.status);
    }).catch((error) => {
      setHttpStatusCode(error.response.status);
    });
  }, []);
  return (
    <>
      {(shouldShowContent && !hasLoaded) && (
      // eslint-disable-next-line no-nested-ternary
        showError ? (httpStatusCode >= 400 && httpStatusCode < 500
          ? (
            <PageBanner
              variant="warning"
            >
              <Icon src={WarningFilled} className="mie-2" /> Please signin to view this content
            </PageBanner>
          ) : <ErrorPage />) : <PageLoading srMessage={loadingMessage} />
      )}
      {shouldShowContent && (
      <div className="unit-iframe-wrapper">
        <iframe title={title} {...contentIFrameProps} data-testid={testIDs.contentIFrame} />
      </div>
      )}
    </>
  );
};
IFrameComponent.propTypes = {
  url: PropTypes.string.isRequired,
  shouldShowContent: PropTypes.bool.isRequired,
  hasLoaded: PropTypes.bool.isRequired,
  loadingMessage: PropTypes.bool.isRequired,
  showError: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  contentIFrameProps: PropTypes.any.isRequired,
};

const ContentIFrame = ({
  iframeUrl,
  shouldShowContent,
  loadingMessage,
  id,
  elementId,
  onLoaded,
  title,
}) => {
  const {
    handleIFrameLoad,
    hasLoaded,
    iframeHeight,
    showError,
  } = hooks.useIFrameBehavior({
    elementId,
    id,
    iframeUrl,
    onLoaded,
  });

  const {
    modalOptions,
    handleModalClose,
  } = hooks.useModalIFrameData();

  const contentIFrameProps = {
    id: elementId,
    src: iframeUrl,
    allow: IFRAME_FEATURE_POLICY,
    allowFullScreen: true,
    height: iframeHeight,
    scrolling: 'no',
    referrerPolicy: 'origin',
    onLoad: handleIFrameLoad,
  };

  let modalContent;
  if (modalOptions.isOpen) {
    modalContent = modalOptions.body
      ? <div className="unit-modal">{ modalOptions.body }</div>
      : (
        <iframe
          title={modalOptions.title}
          allow={IFRAME_FEATURE_POLICY}
          frameBorder="0"
          src={modalOptions.url}
          style={{ width: '100%', height: modalOptions.height }}
        />
      );
  }

  return (
    <>
      <IFrameComponent
        contentIFrameProps={contentIFrameProps}
        showError={showError}
        title={title}
        hasLoaded={hasLoaded}
        url={iframeUrl}
        loadingMessage={loadingMessage}
        shouldShowContent={shouldShowContent}
      />
      {modalOptions.isOpen && (modalOptions.isFullscreen
        ? (
          <ModalDialog
            dialogClassName="modal-lti"
            onClose={handleModalClose}
            size="fullscreen"
            isOpen
            hasCloseButton={false}
          >
            <ModalDialog.Body className={modalOptions.modalBodyClassName}>
              {modalContent}
            </ModalDialog.Body>
          </ModalDialog>

        ) : (
          <Modal
            body={modalContent}
            dialogClassName="modal-lti"
            onClose={handleModalClose}
            open
          />
        )
      )}
    </>
  );
};

ContentIFrame.propTypes = {
  iframeUrl: PropTypes.string,
  id: PropTypes.string.isRequired,
  shouldShowContent: PropTypes.bool.isRequired,
  loadingMessage: PropTypes.node.isRequired,
  elementId: PropTypes.string.isRequired,
  onLoaded: PropTypes.func,
  title: PropTypes.node.isRequired,
};

ContentIFrame.defaultProps = {
  iframeUrl: null,
  onLoaded: () => ({}),
};

export default ContentIFrame;
