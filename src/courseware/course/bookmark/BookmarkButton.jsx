import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Icon, StatefulButton } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';
import { Bookmark, BookmarkBorder } from '@openedx/paragon/icons';
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

const BookmarkButton = ({
  isBookmarked, isProcessing, unitId,
}) => {
  const bookmarkState = isBookmarked ? 'bookmarked' : 'default';
  const state = isProcessing ? `${bookmarkState}Processing` : bookmarkState;

  const dispatch = useDispatch();
  const toggleBookmark = useCallback(() => {
    if (isBookmarked) {
      dispatch(removeBookmark(unitId));
    } else {
      dispatch(addBookmark(unitId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookmarked, unitId]);

  return (
    <StatefulButton
      variant="link"
      className={`px-1 ml-n1 btn-sm text-primary-500 ${isProcessing && 'disabled'}`}
      onClick={toggleBookmark}
      state={state}
      aria-busy={isProcessing}
      disabled={isProcessing}
      labels={{
        default: addBookmarkLabel,
        defaultProcessing: addBookmarkLabel,
        bookmarked: hasBookmarkLabel,
        bookmarkedProcessing: hasBookmarkLabel,
      }}
      icons={{
        default: <Icon src={BookmarkBorder} className="text-primary" />,
        defaultProcessing: <Icon src={BookmarkBorder} className="text-primary" />,
        bookmarked: <Icon src={Bookmark} className="text-primary" />,
        bookmarkedProcessing: <Icon src={Bookmark} className="text-primary" />,
      }}
    />
  );
};

BookmarkButton.propTypes = {
  unitId: PropTypes.string.isRequired,
  isBookmarked: PropTypes.bool,
  isProcessing: PropTypes.bool.isRequired,
};

BookmarkButton.defaultProps = {
  isBookmarked: false,
};

export default BookmarkButton;
