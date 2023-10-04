import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { OuterExamTimer } from '@edx/frontend-lib-special-exams';

import TabPage from './TabPage';

const TabContainer = (props) => {
  const {
    children,
    fetch,
    slice,
    tab,
    isProgressTab,
  } = props;

  const { courseId: courseIdFromUrl, targetUserId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    if (isProgressTab) {
      dispatch(fetch(courseIdFromUrl, targetUserId));
    } else {
      dispatch(fetch(courseIdFromUrl));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdFromUrl, targetUserId]);

  // The courseId from the store is the course we HAVE loaded.  If the URL changes,
  // we don't want the application to adjust to it until it has actually loaded the new data.
  const {
    courseId,
    courseStatus,
  } = useSelector(state => state[slice]);

  return (
    <TabPage
      activeTabSlug={tab}
      courseId={courseId}
      courseStatus={courseStatus}
      metadataModel={`${slice}Meta`}
    >
      {courseId && <OuterExamTimer courseId={courseId} />}
      {children}
    </TabPage>
  );
};

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  fetch: PropTypes.func.isRequired,
  slice: PropTypes.string.isRequired,
  tab: PropTypes.string.isRequired,
  isProgressTab: PropTypes.bool,
};

TabContainer.defaultProps = {
  isProgressTab: false,
};

export default TabContainer;
