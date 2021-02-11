import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import PluginComponent from './PluginComponent';

function PluginTestPage() {
  return (
    <div>
      <h1>Dynamic Plugin Host</h1>
      <h2>App 1</h2>
      <p>
        The Dynamic Plugin will take advantage Module Federation{' '}
        <strong>remotes</strong> and <strong>exposes</strong>. It will no load
        components that have been loaded already.
      </p>
      {/* <Button className="mr-3" onClick={setPluginOne}>Load Plugin One</Button>
      <Button onClick={setPluginTwo}>Load Plugin Two</Button> */}
      <div style={{ marginTop: '2em' }}>
        {getConfig().plugins.slots.testPage.map((plugin) => (
          <PluginComponent
            key={`plugin-${plugin.url}-${plugin.module}`}
            plugin={plugin}
          />
        ))}
      </div>
    </div>
  );
}

export default PluginTestPage;
