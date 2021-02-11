import React, { Component } from 'react';

import Plugin, { COMPONENT } from '../plugin-test/Plugin';

const FALLBACK_URL = 'http://localhost:7331/remoteEntry.js';
const FALLBACK_VIEW = 'PluginOne';

// eslint-disable-next-line react/prefer-stateless-function
export default class NexBlockContainer extends Component {
  render() {
    // eslint-disable-next-line react/prop-types
    const query = new URLSearchParams(this.props.location.search);

    const plugin = {
      url: query.get('url') ?? FALLBACK_URL,
      scope: 'plugin',
      module: `./${query.get('view') ?? FALLBACK_VIEW}`,
      type: COMPONENT,
    };
    return (
      <div style={{ marginTop: '2em' }}>
        <Plugin plugin={plugin} />
      </div>
    );
  }
}
