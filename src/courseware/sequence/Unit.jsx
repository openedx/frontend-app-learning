import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import BookmarkButton from './bookmark/BookmarkButton';
import useBookmark from './bookmark/useBookmark';

export default function Unit({ id, pageTitle, isBookmarked, onBookmarkChanged }) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?is_microfrontend_embed=1`;

  const [iframeHeight, setIframeHeight] = useState(0);
  useEffect(() => {
    global.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'plugin.resize') {
        setIframeHeight(payload.height);
      }
    };
  }, []);

  const [toggleBookmark, requestIsInFlight] = useBookmark(id, isBookmarked, onBookmarkChanged);

  return (
    <div>
      <div className="container-fluid mb-2">
        <h2 className="mb-0">{pageTitle}</h2>
        <BookmarkButton
          onClick={toggleBookmark}
          isBookmarked={isBookmarked}
          isWorking={requestIsInFlight}
        />
      </div>
      <iframe
        title={pageTitle}
        ref={iframeRef}
        src={iframeUrl}
        allowFullScreen
        className="d-block container-fluid px-0"
        height={iframeHeight}
        scrolling="no"
        referrerPolicy="origin"
      />
    </div>
  );
}

Unit.propTypes = {
  id: PropTypes.string.isRequired,
  isBookmarked: PropTypes.bool,
  onBookmarkChanged: PropTypes.func.isRequired,
  pageTitle: PropTypes.string.isRequired,
};

Unit.defaultProps = {
  isBookmarked: false,
};
