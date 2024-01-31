import React from 'react';
import PropTypes from 'prop-types';
import { ensureConfig, getConfig } from '@edx/frontend-platform';

import wrapBlockHtmlForIFrame from './wrap';

ensureConfig(['LMS_BASE_URL', 'SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL'], 'library block component');

/**
 * React component that displays an XBlock in a sandboxed IFrame.
 *
 * The IFrame is resized responsively so that it fits the content height.
 *
 * We use an IFrame so that the XBlock code, including user-authored HTML,
 * cannot access things like the user's cookies, nor can it make GET/POST
 * requests as the user. However, it is allowed to call any XBlock handlers.
 */
class LibraryBlock extends React.Component {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();
    this.state = {
      html: null,
      iFrameHeight: 400,
      iframeKey: 0,
    };
  }

  /**
   * Load the XBlock data from the LMS and then inject it into our IFrame.
   */
  componentDidMount() {
    // Prepare to receive messages from the IFrame.
    // Messages are the only way that the code in the IFrame can communicate
    // with the surrounding UI.
    window.addEventListener('message', this.receivedWindowMessage);

    // Process the XBlock view:
    this.processView();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.view !== this.props.view) {
      this.processView();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receivedWindowMessage);
  }

  /**
   * Handle any messages we receive from the XBlock Runtime code in the IFrame.
   * See wrap.ts to see the code that sends these messages.
   */
  receivedWindowMessage = async (event) => {
    if (this.iframeRef.current === null || event.source !== this.iframeRef.current.contentWindow) {
      return; // This is some other random message.
    }

    const { method, replyKey, ...args } = event.data;
    const frame = this.iframeRef.current.contentWindow;
    const sendReply = async (data) => {
      frame.postMessage({ ...data, replyKey }, '*');
    };

    if (method === 'bootstrap') {
      sendReply({ initialHtml: this.state.html });
    } else if (method === 'get_handler_url') {
      const handlerUrl = await this.props.getHandlerUrl(args.usageId);
      sendReply({ handlerUrl });
    } else if (method === 'update_frame_height') {
      this.setState({ iFrameHeight: args.height });
    } else if (method?.indexOf('xblock:') === 0) {
      // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
      if (this.props.onBlockNotification) {
        this.props.onBlockNotification({
          eventType: method.substr(7), // Remove the 'xblock:' prefix that we added in wrap.ts
          ...args,
        });
      }
    }
  };

  processView() {
    const { view } = this.props;
    if (view.value) {
      const html = wrapBlockHtmlForIFrame(
        view.value.content,
        view.value.resources,
        getConfig().LMS_BASE_URL,
      );

      // Load the XBlock HTML into the IFrame:
      //   iframe will only re-render in react when its property changes (key here)
      this.setState(prevState => ({
        html,
        iframeKey: prevState.iframeKey + 1,
      }));
    }
  }

  render() {
    /* Only draw the iframe if the HTML has already been set.  This is because xblock-bootstrap.html will only request
     * HTML once, upon being rendered. */
    if (this.state.html === null) {
      return null;
    }

    return (
      <div style={{
        height: `${this.state.iFrameHeight}px`,
        boxSizing: 'content-box',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px',
        margin: '24px',
      }}
      >
        <iframe
          key={this.state.iframeKey}
          ref={this.iframeRef}
          title="block"
          src={getConfig().SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL}
          data-testid="block-preview"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            minHeight: '200px',
            border: '0 none',
            backgroundColor: 'white',
          }}
          // allowing 'autoplay' is required to allow the video XBlock to control the YouTube iframe it has.
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          sandbox={[
            'allow-forms',
            'allow-modals',
            'allow-popups',
            'allow-popups-to-escape-sandbox',
            'allow-presentation',
            'allow-same-origin', // This is only secure IF the IFrame source
            // is served from a completely different domain name
            // e.g. labxchange-xblocks.net vs www.labxchange.org
            'allow-scripts',
            'allow-top-navigation-by-user-activation',
          ].join(' ')}
        />
      </div>
    );
  }
}

LibraryBlock.propTypes = {
  getHandlerUrl: PropTypes.func.isRequired,
  onBlockNotification: PropTypes.func,
  view: PropTypes.shape({
    value: PropTypes.shape({
      content: PropTypes.string.isRequired,
      resources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
  }).isRequired,
};

LibraryBlock.defaultProps = {
  onBlockNotification: null,
};

export default LibraryBlock;
