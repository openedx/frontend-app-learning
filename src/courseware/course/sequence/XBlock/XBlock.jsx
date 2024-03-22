import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import wrapBlockHtmlForIFrame from './wrap';
import { getBlockHandlerUrl, renderXBlockView } from '../../../data/api';

/**
 * React component that displays an XBlock in a sandboxed IFrame.
 *
 * The IFrame is resized responsively so that it fits the content height.
 *
 * We use an IFrame so that the XBlock code, including user-authored HTML,
 * cannot access things like the user's cookies, nor can it make GET/POST
 * requests as the user. However, it is allowed to call any XBlock handlers.
 */
class XBlock extends React.Component {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();
    this.state = {
      html: null,
      iFrameHeight: 400,
      iframeKey: 0,
      view: null,
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

    // Fetch the XBlock HTML from the LMS:
    this.fetchBlockHtml();

    // Process the XBlock view:
    this.processView();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.view !== this.state.view) {
      this.processView();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receivedWindowMessage);
  }

  /**
   * Fetch the XBlock HTML and resources from the LMS.
   */
  fetchBlockHtml = async () => {
    try {
      const response = await renderXBlockView(this.props.usageId, 'student_view');
      this.setState({ view: response });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
    }
  };

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
      const handlerUrl = await getBlockHandlerUrl(args.usageId, 'handler_name');
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
    if (this.state.view) {
      // HACK: Replace relative URLs starting with /static/, /assets/, or /xblock/ with absolute ones.
      // This regexp captures the quote character (', ", or their encoded equivalents) followed by the relative path.
      const regexp = /(["']|&#34;|&#39;)\/(static|assets|xblock)\//g;
      const contentString = JSON.stringify(this.state.view.content || '');
      const updatedContentString = contentString.replace(regexp, `$1${getConfig().LMS_BASE_URL}/$2/`);
      const content = JSON.parse(updatedContentString);

      const html = wrapBlockHtmlForIFrame(
        content,
        this.state.view.resources || [],
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
          src="/xblock-bootstrap.html"
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

XBlock.propTypes = {
  onBlockNotification: PropTypes.func,
  usageId: PropTypes.string.isRequired,
};

XBlock.defaultProps = {
  onBlockNotification: null,
};

export default XBlock;
