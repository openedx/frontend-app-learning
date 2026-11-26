import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useCourseHomeMeta, useLiveTabData } from '../data/apiHooks';
import { TabWithTimer } from '../../tab-page';
import { CourseParamsProvider } from '../../generic/course-params';
import LearningWidgetProviders from '../../generic/LearningWidgetProviders';

const LiveTabContent = ({ html = undefined }) => {
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

const LiveTabFrame = ({ courseId }) => {
  const metadataQuery = useCourseHomeMeta(courseId);
  const tabDataQuery = useLiveTabData(courseId);

  return (
    <CourseParamsProvider courseId={courseId}>
      <TabWithTimer
        courseId={courseId}
        courseStatus={{ metadataQuery, tabDataQuery }}
      >
        <LiveTabContent html={tabDataQuery.data?.iframe} />
      </TabWithTimer>
    </CourseParamsProvider>
  );
};

LiveTabFrame.propTypes = {
  courseId: PropTypes.string.isRequired,
};

const LiveTab = ({ courseId }) => (
  <LearningWidgetProviders>
    <LiveTabFrame courseId={courseId} />
  </LearningWidgetProviders>
);

LiveTab.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default LiveTab;
