import { Icon } from '@openedx/paragon';
import { Bookmark } from '@openedx/paragon/icons';

import messages from "../sequence/sequence-navigation/messages";

const BookmarkFilledIcon = (props) => <Icon src={Bookmark} screenReaderText={messages.bookmark.defaultMessage} {...props} />;

export default BookmarkFilledIcon;
