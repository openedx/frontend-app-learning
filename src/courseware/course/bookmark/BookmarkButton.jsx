import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';
import BookmarkOutlineIcon from './BookmarkOutlineIcon';
import BookmarkFilledIcon from './BookmarkFilledIcon';
import { removeBookmark, addBookmark } from './data/thunks';

const addBookmarkLabel = (
  <FormattedMessage
    id="unit.bookmark.button.add.bookmark"
    defaultMessage="Bookmark this page"
    description="The button to bookmark a page"
  />
);

const hasBookmarkLabel = (
  <FormattedMessage
    id="unit.bookmark.button.remove.bookmark"
    defaultMessage="Bookmarked"
    description="The button to show a page is bookmarked and the button to remove that bookmark"
  />
);

export default function BookmarkButton({
  isBookmarked, isProcessing, unitId,
}) {
  const bookmarkState = isBookmarked ? 'bookmarked' : 'default';
  const state = isProcessing ? `${bookmarkState}Processing` : bookmarkState;

  const dispatch = useDispatch();
  const toggleBookmark = useCallback(() => {
    if (isBookmarked) {
      dispatch(removeBookmark(unitId));
    } else {
      dispatch(addBookmark(unitId));
    }
  }, [isBookmarked, unitId]);

  return (
    <StatefulButton
      variant="link"
      className="px-1 ml-n1 btn-sm text-primary-500"
      onClick={toggleBookmark}
      state={state}
      disabledStates={['defaultProcessing', 'bookmarkedProcessing']}
      labels={{
        default: addBookmarkLabel,
        defaultProcessing: addBookmarkLabel,
        bookmarked: hasBookmarkLabel,
        bookmarkedProcessing: hasBookmarkLabel,
      }}
      icons={{
        default: <BookmarkOutlineIcon className="text-primary" />,
        defaultProcessing: <BookmarkOutlineIcon className="text-primary" />,
        bookmarked: <BookmarkFilledIcon className="text-primary" />,
        bookmarkedProcessing: <BookmarkFilledIcon className="text-primary" />,
      }}
    />
  );
}

BookmarkButton.propTypes = {
  unitId: PropTypes.string.isRequired,
  isBookmarked: PropTypes.bool,
  isProcessing: PropTypes.bool.isRequired,
};

BookmarkButton.defaultProps = {
  isBookmarked: false,
};
