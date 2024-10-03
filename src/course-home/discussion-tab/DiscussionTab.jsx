import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const DiscussionTab = () => {
  const { courseId } = useSelector(state => state.courseHome);
  const { path } = useParams();
  const [originalPath] = useState(path);

  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}/${originalPath}`;
  window.location.href = discussionsUrl;
  return (<></>);
};

DiscussionTab.propTypes = {};

export default injectIntl(DiscussionTab);
