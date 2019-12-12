import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import PageLoading from './PageLoading';

import messages from './messages';

function useApi(apiFunction, {
  format = true, keepDataIfFailed = false, loadedIfFailed = false, refreshParams = [],
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFunction().then((response) => {
      const result = format ? camelCaseObject(response.data) : response.data;
      setData(result);
      setLoaded(true);
      setLoading(false);
      setError(null);
      setFailed(false);
    })
      .catch((e) => {
        if (keepDataIfFailed) {
          setData(null);
        }
        setFailed(true);
        setLoading(false);
        if (loadedIfFailed) {
          setLoaded(true);
        }
        setError(e);
      });
  }, refreshParams);

  return {
    data,
    loading,
    loaded,
    failed,
    error,
  };
}

function LearningSequencePage(props) {
  const iframeRef = useRef(null);

  const handleResizeIframe = useCallback(() => {
    // TODO: This won't work because of crossdomain issues.  Leaving here for reference once we're
    // able to have the iFrame content publish resize events through postMessage
    console.log('**** Resizing iframe...');
    const iframe = iframeRef.current;
    const contentHeight = iframe.contentWindow.document.body.scrollHeight;
    console.log(`**** Height is: ${contentHeight}`);
    iframe.height = contentHeight + 20;
  });

  const {
    data,
    loading,
    loaded,
  } = useApi(
    async () => getAuthenticatedHttpClient().get(`${getConfig().LMS_BASE_URL}/api/courses/v1/blocks/?course_id=${props.match.params.courseId}&username=staff&depth=all&block_types_filter=sequential&requested_fields=children`, {}),
    {
      keepDataIfFailed: false,
      refreshParams: [
        props.match.params.courseId,
        props.match.params.blockIndex,
      ],
    },
  );

  console.log(data);

  if (loading) {
    return (
      <PageLoading srMessage={props.intl.formatMessage(messages['learn.loading.learning.sequence'])} />
    );
  }

  return (
    <main>
      <div className="container-fluid">
        <h1>Learning Sequence Page</h1>
        {loaded && data.blocks ? (
          <iframe
            title="yus"
            ref={iframeRef}
            src={Object.values(data.blocks)[parseInt(props.match.params.blockIndex, 10)].studentViewUrl}
            onLoad={handleResizeIframe}
            height={500}
          />
        ) : null}
      </div>
    </main>
  );
}

LearningSequencePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      blockIndex: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(LearningSequencePage);
