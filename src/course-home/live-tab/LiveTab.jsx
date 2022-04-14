import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

function LiveTab() {
  const { courseId } = useSelector(state => state.courseHome);
  const liveModel = useSelector(state => state.models.live);
  useEffect(() => {
    const iframe = document.getElementById('lti-tab-embed');
    if (iframe) {
      iframe.className += ' vh-100 w-100 border-0';
    }
  }, []);
  return (
    <div
      id="live_tab"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: liveModel[courseId]?.iframe }}
    />
  );
}

export default LiveTab;
