import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';

function loadPluginComponent(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__('default');

    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // eslint-disable-next-line no-undef
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

async function loadDynamicScript(url) {
  return new Promise((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      // eslint-disable-next-line no-console
      console.log(`Dynamic Script Loaded: ${url}`);
      resolve();
    };

    element.onerror = () => {
      // eslint-disable-next-line no-console
      console.error(`Dynamic Script Error: ${url}`);
      reject();
    };

    document.head.appendChild(element);
  });
}

const useDynamicScript = (args) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [element, setElement] = React.useState(null);
  React.useEffect(() => {
    if (!args.url) {
      return;
    }

    setReady(false);
    setFailed(false);

    loadDynamicScript(args.url).then((el) => {
      setElement(el);
      setReady(true);
    }).catch(() => {
      setReady(false);
      setFailed(true);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      // eslint-disable-next-line no-console
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};

function Plugin({ plugin }) {
  const { ready, failed } = useDynamicScript({
    url: plugin && plugin.url,
  });

  if (!plugin) {
    return <h2>No plugin specified</h2>;
  }

  if (!ready) {
    return <h2>Loading plugin script: {plugin.url}</h2>;
  }

  if (failed) {
    return <h2>Failed to load plugin script: {plugin.url}</h2>;
  }

  const PluginComponent = React.lazy(
    loadPluginComponent(plugin.scope, plugin.module),
  );

  return (
    <React.Suspense fallback="Loading Plugin">
      <PluginComponent />
    </React.Suspense>
  );
}

Plugin.propTypes = {
  plugin: PropTypes.shape({
    scope: PropTypes.string.isRequired,
    module: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }),
};

Plugin.defaultProps = {
  plugin: null,
};

function PluginTest() {
  const [plugin, setPlugin] = React.useState(undefined);

  function setPluginOne() {
    setPlugin({
      url: 'http://localhost:7331/remoteEntry.js',
      scope: 'plugin',
      module: './PluginOne',
    });
  }

  function setPluginTwo() {
    setPlugin({
      url: 'http://localhost:7331/remoteEntry.js',
      scope: 'plugin',
      module: './PluginTwo',
    });
  }

  return (
    <div>
      <h1>Dynamic Plugin Host</h1>
      <h2>App 1</h2>
      <p>
        The Dynamic Plugin will take advantage Module Federation{' '}
        <strong>remotes</strong> and <strong>exposes</strong>. It will no load
        components that have been loaded already.
      </p>
      <Button className="mr-3" onClick={setPluginOne}>Load Plugin One</Button>
      <Button onClick={setPluginTwo}>Load Plugin Two</Button>
      <div style={{ marginTop: '2em' }}>
        <Plugin plugin={plugin} />
      </div>
    </div>
  );
}

export default PluginTest;
