import { Icon, StatefulButton } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Bookmark, BookmarkBorder } from '@openedx/paragon/icons';
import { useSetBookmarked } from './data/apiHooks';

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

interface Props {
  unitId: string;
  isBookmarked?: boolean;
  isProcessing: boolean;
}

const BookmarkButton = ({
  isBookmarked = false, isProcessing, unitId,
}: Props) => {
  const bookmarkState = isBookmarked ? 'bookmarked' : 'default';
  const state = isProcessing ? `${bookmarkState}Processing` : bookmarkState;

  const setBookmarked = useSetBookmarked();
  const toggleBookmark = () => setBookmarked(unitId, !isBookmarked);

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

export default BookmarkButton;
