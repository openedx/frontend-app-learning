import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import React from 'react';
import { useSelector } from 'react-redux';
import { useIFrameHeight } from '../../generic/hooks';

function DiscussionTab() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const [, iFrameHeight] = useIFrameHeight();
  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}`;
  return (
    <iframe
      src={discussionsUrl}
      className="d-flex w-100 border-0"
      height={iFrameHeight}
      style={{ minHeight: '60rem' }}
      title="discussion"
    />
  );
}

DiscussionTab.propTypes = {};

export default injectIntl(DiscussionTab);
