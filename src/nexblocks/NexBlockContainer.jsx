import React, { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import Plugin, { COMPONENT } from '../plugin-test/Plugin';

const FALLBACK_URL = 'http://localhost:7331/remoteEntry.js';
const FALLBACK_VIEW = 'PluginOne';

// eslint-disable-next-line react/prefer-stateless-function
export default function NexBlockContainer() {
  // eslint-disable-next-line react/prop-types
  const query = new URLSearchParams(window.location.search);

  const plugin = {
    url: query.get('url') ?? FALLBACK_URL,
    scope: 'plugin',
    module: `./${query.get('view') ?? FALLBACK_VIEW}`,
    type: COMPONENT,
  };

  const [instanceData, setInstanceData] = useState({ title: 'Loading...', body: '' });
  const usageId = query.get('usage_id');
  const DATA_URL = `http://localhost:18000/api/nexblocks/v0/instance-data/${usageId}`;
  const httpClient = getAuthenticatedHttpClient();

  useEffect(() => {
    httpClient.get(DATA_URL, { params: {} }).then(({ data }) => {
      setInstanceData(data);
    });
  }, []);

  return (
    <div style={{ marginTop: '2em' }}>
      <Plugin plugin={plugin} instanceData={instanceData} />
    </div>
  );
}
