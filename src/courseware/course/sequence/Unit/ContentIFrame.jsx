import PropTypes from 'prop-types';
import React from 'react';

import { ErrorPage } from '@edx/frontend-platform/react';
import { StrictDict } from '@edx/react-unit-test-utils';
import { ModalDialog } from '@openedx/paragon';
import { ContentIFrameLoaderSlot } from '../../../../plugin-slots/ContentIFrameLoaderSlot';

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
  'microphone *; camera *; midi *; geolocation *; encrypted-media *; clipboard-write *; autoplay *'
);

export const testIDs = StrictDict({
  contentIFrame: 'content-iframe-test-id',
  modalIFrame: 'modal-iframe-test-id',
});

const ContentIFrame = ({
  iframeUrl,
  shouldShowContent,
  loadingMessage,
  id,
  elementId,
  onLoaded,
  title,
  courseId,
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

  return (
    <>
      {(shouldShowContent && !hasLoaded) && (
        showError ? <ErrorPage /> : <ContentIFrameLoaderSlot courseId={courseId} loadingMessage={loadingMessage} />
      )}
      {shouldShowContent && (
        <div className="unit-iframe-wrapper">
          <iframe title={title} {...contentIFrameProps} data-testid={testIDs.contentIFrame} />
        </div>
      )}
      {modalOptions.isOpen
          && (
          <ModalDialog
            className="modal-lti"
            onClose={handleModalClose}
            size={modalOptions.isFullscreen ? 'fullscreen' : 'md'}
            isOpen
            hasCloseButton={false}
          >
            <ModalDialog.Body className={modalOptions.modalBodyClassName}>
              {modalOptions.body
                ? <div className="unit-modal">{ modalOptions.body }</div>
                : (
                  <iframe
                    title={modalOptions.title}
                    allow={IFRAME_FEATURE_POLICY}
                    frameBorder="0"
                    src={modalOptions.url}
                    style={{ width: '100%', height: modalOptions.height }}
                  />
                )}
            </ModalDialog.Body>
          </ModalDialog>
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
  courseId: PropTypes.string,
};

ContentIFrame.defaultProps = {
  iframeUrl: null,
  onLoaded: () => ({}),
  courseId: '',
};

export default ContentIFrame;
