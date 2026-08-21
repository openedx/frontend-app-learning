import { getConfig } from '@edx/frontend-platform';
import React, { useState } from 'react';
import { useParams, generatePath, useNavigate } from 'react-router-dom';
import { useIFrameHeight, useIFramePluginEvents } from '../../generic/hooks';
import { useCourseHomeMeta } from '../data/apiHooks';
import { TabWithTimer } from '../../tab-page';

const DiscussionTabContent = () => {
  const { courseId, path } = useParams();
  const [originalPath] = useState(path);
  const navigate = useNavigate();

  const [, iFrameHeight] = useIFrameHeight();
  useIFramePluginEvents({
    'discussions.navigate': (payload) => {
      const basePath = generatePath('/course/:courseId/discussion', { courseId });
      navigate(`${basePath}/${payload.path}`);
    },
  });
  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}/${originalPath}`;
  return (
    <iframe
      src={discussionsUrl}
      className="d-flex w-100 border-0"
      height={iFrameHeight}
      style={{ minHeight: '60rem' }}
      title="discussion"
    />
  );
};

const DiscussionTab = () => {
  const { courseId } = useParams();

  const metadataQuery = useCourseHomeMeta(courseId);

  return (
    <TabWithTimer
      activeTabSlug="discussion"
      courseId={courseId}
      courseStatus={{ metadataQuery }}
    >
      <DiscussionTabContent />
    </TabWithTimer>
  );
};

export default DiscussionTab;
