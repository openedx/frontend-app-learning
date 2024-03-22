/* eslint-disable no-param-reassign */
/**
 * Code to wrap an XBlock so that we can embed it in an IFrame
 */

/**
 * The JavaScript code which runs inside our IFrame and is responsible
 * for communicating with the parent window.
 *
 * This cannot use any imported functions because it runs in the IFrame,
 * not in our app webpack bundle.
 */
function blockFrameJS() {
  const CHILDREN_KEY = '_jsrt_xb_children'; // JavaScript RunTime XBlock children
  const USAGE_ID_KEY = '_jsrt_xb_usage_id';
  const HANDLER_URL = '_jsrt_xb_handler_url';

  const uniqueKeyPrefix = `k${+Date.now()}-${Math.floor(Math.random() * 1e10)}-`;
  let messageCount = 0;
  /**
   * A helper method for sending messages to the parent window of this IFrame
   * and getting a reply, even when the IFrame is securely sandboxed.
   * @param messageData The message to send. Must be an object, as we add a key/value pair to it.
   * @param callback The callback to call when the parent window replies
   */
  function postMessageToParent(messageData, callback) {
    messageCount += 1;
    const messageReplyKey = uniqueKeyPrefix + messageCount;
    messageData.replyKey = messageReplyKey;
    if (callback !== undefined) {
      const handleResponse = (event) => {
        if (event.source === window.parent && event.data.replyKey === messageReplyKey) {
          callback(event.data);
          window.removeEventListener('message', handleResponse);
        }
      };
      window.addEventListener('message', handleResponse);
    }
    window.parent.postMessage(messageData, '*');
  }

  /**
   * The JavaScript runtime for any XBlock in the IFrame
   */
  const runtime = {
    /**
     * An obscure and little-used API that retrieves a particular
     * XBlock child using its 'data-name' attribute
     * @param block The root DIV element of the XBlock calling this method
     * @param childName The value of the 'data-name' attribute of the root
     *    DIV element of the XBlock child in question.
     */
    childMap: (block, childName) => runtime.children(block).find((child) => child.element.getAttribute('data-name') === childName),
    children: (block) => block[CHILDREN_KEY],
    /**
     * Get the URL for the specified handler. This method must be synchronous, so
     * cannot make HTTP requests.
     */
    handlerUrl: (block, handlerName, suffix, query) => {
      let url = block[HANDLER_URL].replace('handler_name', handlerName);
      if (suffix) {
        url += `${suffix}/`;
      }
      if (query) {
        url += `?${query}`;
      }
      return url;
    },
    /**
     * Pass an arbitrary message from the XBlock to the parent application.
     * This is mostly used by the studio_view to inform the user of save events.
     * Standard events are as follows:
     *
     * save: {state: 'start'|'end', message: string}
     * -> Displays a "Saving..." style message + animation to the user until called
     *    again with {state: 'end'}. Then closes the modal holding the studio_view.
     *
     * error: {title: string, message: string}
     * -> Displays an error message to the user
     *
     * cancel: {}
     * -> Close the modal holding the studio_view
     */
    notify: (eventType, params) => {
      params.method = `xblock:${eventType}`;
      postMessageToParent(params);
    },
  };

  /**
   * Initialize an XBlock. This function should only be called by initializeXBlockAndChildren
   * because it assumes that function has already run.
   */
  function initializeXBlock(element, callback) {
    const usageId = element[USAGE_ID_KEY];
    // Check if the XBlock has an initialization function:
    const initFunctionName = element.getAttribute('data-init');
    if (initFunctionName !== null) {
      // Since this block has an init function, it may need to call handlers,
      // so we first have to generate a secure handler URL for it:
      postMessageToParent({ method: 'get_handler_url', usageId }, (handlerData) => {
        element[HANDLER_URL] = handlerData.handlerUrl;

        // HACK: Replace the old handler URL with the v2 XBlock API.
        element.innerHTML = element.innerHTML.replace(/data-url="[^"]*"/, `data-url="${handlerData.handlerUrl.replace('handler_name/', 'xmodule_handler')}"`);

        // Now proceed with initializing the block's JavaScript:
        const InitFunction = (window)[initFunctionName];
        // Does the XBlock HTML contain arguments to pass to the InitFunction?
        let data = {};
        [].forEach.call(element.children, (childNode) => {
          // The newer/pure/Blockstore runtime uses 'xblock_json_init_args'
          // while the LMS runtime uses 'xblock-json-init-args'.
          if (
            childNode.matches('script.xblock_json_init_args')
            || childNode.matches('script.xblock-json-init-args')
          ) {
            data = JSON.parse(childNode.textContent);
          }
        });
        // An unfortunate inconsistency is that the old Studio runtime used
        // to pass 'element' as a jQuery-wrapped DOM element, whereas the LMS
        // runtime used to pass 'element' as the pure DOM node. In order not to
        // break backwards compatibility, we would need to maintain that.
        // However, this is currently disabled as it causes issues (need to
        // modify the runtime methods like handlerUrl too), and we decided not
        // to maintain support for legacy studio_view in this runtime.
        // const isStudioView = element.className.indexOf('studio_view') !== -1;
        // const passElement = isStudioView && (window as any).$ ? (window as any).$(element) : element;

        const blockJS = new InitFunction(runtime, element, data) || {};
        blockJS.element = element;
        callback(blockJS);
      });
    } else {
      const blockJS = { element };
      callback(blockJS);
    }
  }

  // Recursively initialize the JavaScript code of each XBlock:
  function initializeXBlockAndChildren(element, callback) {
    // The newer/pure/Blockstore runtime uses the 'data-usage' attribute, while the LMS uses 'data-usage-id'
    const usageId = element.getAttribute('data-usage') || element.getAttribute('data-usage-id');
    if (usageId !== null) {
      element[USAGE_ID_KEY] = usageId;
    } else {
      throw new Error('XBlock is missing a usage ID attribute on its root HTML node.');
    }

    const version = element.getAttribute('data-runtime-version');
    if (version != null && version !== '1') {
      throw new Error('Unsupported XBlock runtime version requirement.');
    }

    // Recursively initialize any children first:
    // We need to find all div.xblock-v1 children, unless they're grandchilden
    // So we build a list of all div.xblock-v1 descendants that aren't descendants
    // of an already-found descendant:
    const childNodesFound = [];
    [].forEach.call(element.querySelectorAll('.xblock, .xblock-v1'), (childNode) => {
      if (!childNodesFound.find((el) => el.contains(childNode))) {
        childNodesFound.push(childNode);
      }
    });

    // This code is awkward because we can't use promises (IE11 etc.)
    let childrenInitialized = -1;
    function initNextChild() {
      childrenInitialized += 1;
      if (childrenInitialized < childNodesFound.length) {
        const childNode = childNodesFound[childrenInitialized];
        initializeXBlockAndChildren(childNode, initNextChild);
      } else {
        // All children are initialized:
        initializeXBlock(element, callback);
      }
    }
    initNextChild();
  }

  // Find the root XBlock node.
  // The newer/pure/Blockstore runtime uses '.xblock-v1' while the LMS runtime uses '.xblock'.
  const rootNode = document.querySelector('.xblock, .xblock-v1'); // will always return the first matching element
  initializeXBlockAndChildren(rootNode, () => {
    // When done, tell the parent window the size of this block:
    postMessageToParent({
      height: document.body.scrollHeight,
      method: 'update_frame_height',
    });
    postMessageToParent({ method: 'init_done' });
  });

  let lastHeight = -1;
  function checkFrameHeight() {
    const newHeight = document.documentElement.scrollHeight;
    if (newHeight !== lastHeight) {
      postMessageToParent({ method: 'update_frame_height', height: newHeight });
      lastHeight = newHeight;
    }
  }
  // Check the size whenever the DOM changes:
  new MutationObserver(checkFrameHeight).observe(document.body, { attributes: true, childList: true, subtree: true });
  // And whenever the IFrame is resized
  window.addEventListener('resize', checkFrameHeight);
}

/**
 * Given an XBlock's fragment data (HTML plus CSS and JS URLs), return the
 * inner HTML that should go into an IFrame in order to display that XBlock
 * and interact with the surrounding LabXchange UI and with the LMS.
 * @param html The XBlock's HTML (Fragment.content)
 * @param jsUrls A list of any JavaScript URLs the XBlock may require
 * @param cssUrls A list of any CSS URLs the XBlock may require
 * @param lmsBaseUrl The absolute URL of the LMS, e.g. http://localhost:18000
 *                   Only required for legacy XBlocks that don't declare their
 *                   JS and CSS dependencies properly.
 */
export default function wrapBlockHtmlForIFrame(html, resources, lmsBaseUrl) {
  /* Separate resources by kind. */
  const urlResources = resources.filter((r) => r.kind === 'url');
  const textResources = resources.filter((r) => r.kind === 'text');

  /* Extract CSS resources. */
  const cssUrls = urlResources.filter((r) => r.mimetype === 'text/css').map((r) => r.data);
  const sheets = textResources.filter((r) => r.mimetype === 'text/css').map((r) => r.data);
  let cssTags = cssUrls.map((url) => `<link rel="stylesheet" href="${lmsBaseUrl}${url}">`).join('\n');
  cssTags += sheets.map((sheet) => `<style>${sheet}</style>`).join('\n');

  /* Extract JS resources. */
  const jsUrls = urlResources.filter((r) => r.mimetype === 'application/javascript').map((r) => r.data);
  const scripts = textResources.filter((r) => r.mimetype === 'application/javascript').map((r) => r.data);
  let jsTags = jsUrls.map((url) => `<script src="${lmsBaseUrl}${url}"></script>`).join('\n');
  jsTags += scripts.map((script) => `<script>${script}</script>`).join('\n');

  // Most older XModules/XBlocks have a ton of undeclared dependencies on various JavaScript in the global scope.
  // ALL XBlocks should be re-written to fully provide their own JS dependencies.
  // We use 'learn_view' and 'edit_view' to declare a new, global-free, iframe JS environment for those new XBlocks
  // that want full control over their JavaScript environment.
  //
  // Otherwise, if the XBlock uses 'student_view', 'author_view', or 'studio_view', include known required globals:
  let legacyIncludes = '';
  if (
    html.indexOf('xblock-student_view') !== -1
    || html.indexOf('xblock-public_view') !== -1
    || html.indexOf('xblock-studio_view') !== -1
    || html.indexOf('xblock-author_view') !== -1
  ) {
    legacyIncludes += `
      <!-- gettext & XBlock JS i18n code -->
      <script type="text/javascript" src="${lmsBaseUrl}/static/js/i18n/en/djangojs.js"></script>
      <!-- Most XBlocks require jQuery: -->
      <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
      <!-- The Video XBlock requires "ajaxWithPrefix" -->
      <script type="text/javascript">
          $.postWithPrefix = $.post;
          $.getWithPrefix = $.get;
          $.ajaxWithPrefix = $.ajax;
      </script>
      <!-- The Video XBlock requires "Slider" from jQuery-UI: -->
      <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
      <!-- The video XBlock depends on Underscore.JS -->
      <script type="text/javascript" src="${lmsBaseUrl}/static/common/js/vendor/underscore.js"></script>
      <!-- The video XBlock depends on jquery-cookie -->
      <script type="text/javascript" src="${lmsBaseUrl}/static/js/vendor/jquery.cookie.js"></script>
      <!--The Video XBlock has an undeclared dependency on 'Logger' -->
      <script>
          window.Logger = { log: function() { } };
      </script>
      <!-- Builtin XBlock types depend on RequireJS -->
      <script type="text/javascript" src="${lmsBaseUrl}/static/common/js/vendor/require.js"></script>
      <script type="text/javascript" src="${lmsBaseUrl}/static/js/RequireJS-namespace-undefine.js"></script>
      <script>
          // The minimal RequireJS configuration required for common LMS building XBlock types to work:
          (function (require, define) {
              require.config({
                  baseUrl: "${lmsBaseUrl}/static/",
                  paths: {
                      accessibility: 'js/src/accessibility_tools',
                      draggabilly: 'js/vendor/draggabilly',
                      hls: 'common/js/vendor/hls',
                      moment: 'common/js/vendor/moment-with-locales',
                      'moment-timezone': 'common/js/vendor/moment-timezone-with-data',
                      HtmlUtils: 'edx-ui-toolkit/js/utils/html-utils',
                  },
              });
              define('gettext', [], function() { return window.gettext; });
              define('jquery', [], function() { return window.jQuery; });
              define('jquery-migrate', [], function() { return window.jQuery; });
              define('underscore', [], function() { return window._; });
          }).call(this, require || RequireJS.require, define || RequireJS.define);
      </script>
      <!-- edX HTML Utils requires GlobalLoader -->
      <script type="text/javascript" src="${lmsBaseUrl}/static/edx-ui-toolkit/js/utils/global-loader.js"></script>
      <script>
      
      // Required by moment-timezone, which is used by the LibraryContentBlock.
      RequireJS.require(['moment']);
      
      // The video XBlock has an undeclared dependency on edX HTML Utils
      RequireJS.require(['HtmlUtils'], function (HtmlUtils) {
          window.edx.HtmlUtils = HtmlUtils;
          // The problem XBlock depends on window.SR, though 'accessibility_tools' has an undeclared dependency on HtmlUtils:
          RequireJS.require(['accessibility']);
      });
      RequireJS.require(['edx-ui-toolkit/js/utils/string-utils'], function (StringUtils) {
          window.edx.StringUtils = StringUtils;
      });
      </script>
      <!-- 
          commons.js: this file produced by webpack contains many shared chunks of code.
          By including this, you have only to also import any of the smaller entrypoint
          files (defined in webpack.common.config.js) to get that entry point and all
          of its dependencies.
      -->
      <script type="text/javascript" src="${lmsBaseUrl}/static/bundles/commons.js"></script>
      <!-- The video XBlock (and perhaps others?) expect this global: -->
      <script>
      window.onTouchBasedDevice = function() { return navigator.userAgent.match(/iPhone|iPod|iPad|Android/i); };
      </script>
      <!-- At least one XBlock (drag and drop v2) expects Font Awesome -->
      <link rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
      <!-- Capa Problem Editing requires CodeMirror -->
      <link rel="stylesheet" href="${lmsBaseUrl}/static/js/vendor/CodeMirror/codemirror.css">
      <!-- Built-in XBlocks (and some plugins) depends on LMS CSS -->
      <link rel="stylesheet" href="${lmsBaseUrl}/static/css/lms-course.css">
      <!-- Configure and load MathJax -->
      <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [
              ['\\\\(','\\\\)'],
              ['[mathjaxinline]','[/mathjaxinline]']
            ],
            displayMath: [
              ['\\\\[','\\\\]'],
              ['[mathjax]','[/mathjax]']
            ]
          }
        });
      </script>
      <script type="text/x-mathjax-config">
        MathJax.Hub.signal.Interest(function(message) {
          if(message[0] === "End Math") {
              set_mathjax_display_div_settings();
          }
        });
        function set_mathjax_display_div_settings() {
          $('.MathJax_Display').each(function( index ) {
            this.setAttribute('tabindex', '0');
            this.setAttribute('aria-live', 'off');
            this.removeAttribute('role');
            this.removeAttribute('aria-readonly');
          });
        }
      </script>
      <script type="text/javascript">
          // Activating Mathjax accessibility files
          window.MathJax = {
              menuSettings: {
                  collapsible: true,
                  autocollapse: false,
                  explorer: true
              }
          };
      </script>
      <!-- This must appear after all mathjax-config blocks, so it is after the imports from the other templates.
           It can't be run through static.url because MathJax uses crazy url introspection to do lazy loading of
           MathJax extension libraries -->
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/mathjax@2.7.5/MathJax.js?config=TeX-MML-AM_SVG"></script>
    `;
  }

  const result = `
    <!DOCTYPE html>
    <html>
    <head>
      <!-- Open links in a new tab, not this iframe -->
      <base target="_blank">
      <meta charset="UTF-8">
      ${legacyIncludes}
      ${cssTags}
    </head>
    <!-- A Studio-served stylesheet will set the body min-height to 100% (a common strategy to allow for background
    images to fill the viewport), but this has the undesireable side-effect of causing an infinite loop via the
    onResize event listeners in certain situations.  Resetting it to the default "auto" skirts the problem. -->
    <body style="min-height: auto; background-color: white">
      ${html}
      ${jsTags}
      <script>
        window.addEventListener('load', (${blockFrameJS.toString()}));
      </script>
    </body>
    </html>
  `;

  return result;
}
