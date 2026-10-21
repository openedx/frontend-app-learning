import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { useCourseHomeMeta, useLiveTabData } from '../data/apiHooks';
import { TabWithTimer } from '../../tab-page';

const LiveTabContent = ({ html }) => {
  useEffect(() => {
    const iframe = document.getElementById('lti-tab-embed');
    if (iframe) {
      iframe.className += ' vh-100 w-100 border-0';
    }
  }, [html]);
  return (
    <div
      id="live_tab"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

LiveTabContent.propTypes = {
  html: PropTypes.string,
};

LiveTabContent.defaultProps = {
  html: undefined,
};

const LiveTab = () => {
  const { courseId } = useParams();

  const metadataQuery = useCourseHomeMeta(courseId);
  const tabDataQuery = useLiveTabData(courseId);

  return (
    <TabWithTimer
      activeTabSlug="lti_live"
      courseId={courseId}
      courseStatus={{ metadataQuery, tabDataQuery }}
    >
      <LiveTabContent html={tabDataQuery.data?.iframe} />
    </TabWithTimer>
  );
};

export default LiveTab;
