import React from 'react';

import { Button } from '@edx/paragon';

import Plugin, { SCRIPT, COMPONENT } from './Plugin';

function PluginTestPage() {
  const [plugin, setPlugin] = React.useState(undefined);

  function setPluginOne() {
    setPlugin({
      url: 'http://localhost:7331/remoteEntry.js',
      scope: 'plugin',
      module: './PluginOne',
      type: SCRIPT,
    });
  }

  function setPluginTwo() {
    setPlugin({
      url: 'http://localhost:7331/remoteEntry.js',
      scope: 'plugin',
      module: './PluginTwo',
      type: COMPONENT,
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

export default PluginTestPage;
