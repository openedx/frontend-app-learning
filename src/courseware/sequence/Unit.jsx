import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { connect } from 'react-redux';
import BookmarkButton from './bookmark/BookmarkButton';
import { addBookmark, removeBookmark } from '../../data/course-blocks/thunks';

function Unit({
  bookmarked,
  bookmarkedUpdateState,
  displayName,
  id,
  ...props
}) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?show_title=0&show_bookmark_button=0`;

  const [iframeHeight, setIframeHeight] = useState(0);
  useEffect(() => {
    global.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'plugin.resize') {
        setIframeHeight(payload.height);
      }
    };
  }, []);

  const toggleBookmark = () => {
    if (bookmarked) {
      props.removeBookmark(id);
    } else {
      props.addBookmark(id);
    }
  };

  return (
    <div>
      <div className="container-fluid mb-2">
        <h2 className="mb-0">{displayName}</h2>
        <BookmarkButton
          onClick={toggleBookmark}
          isBookmarked={bookmarked}
          isProcessing={bookmarkedUpdateState === 'loading'}
        />
      </div>
      <iframe
        title={displayName}
        ref={iframeRef}
        src={iframeUrl}
        allowFullScreen
        className="d-block container-fluid px-0"
        height={iframeHeight}
        scrolling="no"
        referrerPolicy="origin"
        style={{ border: 0, width: '100%' }}
      />
    </div>
  );
}

Unit.propTypes = {
  addBookmark: PropTypes.func.isRequired,
  bookmarked: PropTypes.bool,
  bookmarkedUpdateState: PropTypes.string,
  displayName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  removeBookmark: PropTypes.func.isRequired,
};

Unit.defaultProps = {
  bookmarked: false,
  bookmarkedUpdateState: undefined,
};

const mapStateToProps = (state, props) => state.courseBlocks.blocks[props.id] || {};

export default connect(mapStateToProps, {
  addBookmark,
  removeBookmark,
})(Unit);
