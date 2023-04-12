import PropTypes from 'prop-types';
import React from 'react';

import { ErrorPage } from '@edx/frontend-platform/react';
import { Modal } from '@edx/paragon';
import PageLoading from '../../../../generic/PageLoading';
import LocalIFrame from './LocalIFrame';
import { renderers } from './constants';
import hooks from './hooks';

/**
 * Feature policy for iframe, allowing access to certain courseware-related media.
 *
 * We must use the wildcard (*) origin for each feature, as courseware content
 * may be embedded in external iframes. Notably, xblock-lti-consumer is a popular
 * block that iframes external course content.

 * This policy was selected in conference with the edX Security Working Group.
 * Changes to it should be vetted by them (security@edx.org).
 */
const IFRAME_FEATURE_POLICY = (
  'microphone *; camera *; midi *; geolocation *; encrypted-media *'
);

const ContentIFrame = ({
  iframeUrl,
  showContent,
  loadingMessage,
  id,
  elementId,
  onLoaded,
  title,
  childBlocks,
}) => {
  const {
    hasLoaded,
    showError,
    modalOptions,
    handleModalClose,
    handleIFrameLoad,
    iframeHeight,
  } = hooks.useIFrameBehavior({
    id,
    elementId,
    onLoaded,
    title,
  });

  const renderModal = () => (
    <Modal
      body={(
        <>
          {modalOptions.body
            ? <div className="unit-modal">{ modalOptions.body }</div>
            : (
              <iframe
                title={modalOptions.title}
                allow={IFRAME_FEATURE_POLICY}
                frameBorder="0"
                src={modalOptions.url}
                style={{
                  width: '100%',
                  height: '100vh',
                }}
              />
            )}
        </>
      )}
      onClose={handleModalClose}
      open
      dialogClassName="modal-lti"
    />
  );

  const renderChild = (childBlock) => {
    const Renderer = renderers[childBlock.type];
    return (<Renderer key={childBlock.id} {...childBlock.student_view_data} block={childBlock} />);
  };

  const renderContent = () => {
    if (iframeUrl) {
      return (
        <>
          {!hasLoaded && (
            showError ? <ErrorPage /> : <PageLoading srMessage={loadingMessage} />
          )}
          <div className="unit-iframe-wrapper">
            <iframe
              id={elementId}
              title={title}
              src={iframeUrl}
              allow={IFRAME_FEATURE_POLICY}
              allowFullScreen
              height={iframeHeight}
              scrolling="no"
              referrerPolicy="origin"
              onLoad={handleIFrameLoad}
            />
          </div>
        </>
      );
    }
    return (
      <>
        {childBlocks.map(renderChild)}
      </>
    );
  };

  return (
    <>
      {showContent && renderContent()}
      {modalOptions.open && renderModal()}
    </>
  );
};

ContentIFrame.propTypes = {
  iframeUrl: PropTypes.string,
  id: PropTypes.string.isRequired,
  showContent: PropTypes.bool.isRequired,
  loadingMessage: PropTypes.node.isRequired,
  elementId: PropTypes.string.isRequired,
  onLoaded: PropTypes.func,
  title: PropTypes.node.isRequired,
  childBlocks: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    student_view_data: PropTypes.shape({
      enabled: PropTypes.bool,
    }),
  })).isRequired,
};

ContentIFrame.defaultProps = {
  iframeUrl: null,
  onLoaded: () => ({}),
};

export default ContentIFrame;
