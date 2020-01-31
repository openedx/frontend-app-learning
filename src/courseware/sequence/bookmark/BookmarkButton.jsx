import React from 'react';
import { StatefulButton } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import BookmarkOutlineIcon from './BookmarkOutlineIcon';
import BookmarkFilledIcon from './BookmarkFilledIcon';
import SpinnerIcon from './SpinnerIcon';

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

export default function BookmarkButton({ onClick, isBookmarked, isWorking }) {
  const bookmarkState = isBookmarked ? 'bookmarked' : 'default';
  const state = isWorking ? `${bookmarkState}Working` : bookmarkState;

  return (
    <StatefulButton
      className="btn-link px-1 ml-n1"
      onClick={onClick}
      state={state}
      disabledStates={['defaultWorking', 'bookmarkedWorking']}
      labels={{
        default: addBookmarkLabel,
        defaultWorking: addBookmarkLabel,
        bookmarked: hasBookmarkLabel,
        bookmarkedWorking: hasBookmarkLabel,
      }}
      icons={{
        default: <BookmarkOutlineIcon className="text-primary" />,
        defaultWorking: <SpinnerIcon spin className="text-primary" />,
        bookmarked: <BookmarkFilledIcon className="text-primary" />,
        bookmarkedWorking: <SpinnerIcon spin className="text-primary" />,
      }}
    />
  );
}
