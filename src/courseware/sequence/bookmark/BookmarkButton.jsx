import React from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import BookmarkOutlineIcon from './BookmarkOutlineIcon';
import BookmarkFilledIcon from './BookmarkFilledIcon';

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

export default function BookmarkButton({ onClick, isBookmarked, isProcessing }) {
  const bookmarkState = isBookmarked ? 'bookmarked' : 'default';
  const state = isProcessing ? `${bookmarkState}Processing` : bookmarkState;

  return (
    <StatefulButton
      className="btn-link px-1 ml-n1 btn-sm"
      onClick={onClick}
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
  onClick: PropTypes.func.isRequired,
  isBookmarked: PropTypes.bool,
  isProcessing: PropTypes.bool.isRequired,
};

BookmarkButton.defaultProps = {
  isBookmarked: false,
};
