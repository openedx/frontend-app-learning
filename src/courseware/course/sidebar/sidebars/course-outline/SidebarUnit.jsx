import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  EditSquareIcon, EditSquareCompleteIcon, VideocamIcon, VideocamCompleteIcon,
  BookIcon, BookCompleteIcon,
} from './icons';
import messages from './messages';

const MOCKED_TYPE = 'problem'; // ToDo: should be refactored after API is ready

const SidebarUnit = ({
  id,
  intl,
  courseId,
  first,
  sequence,
  isActive,
}) => {
  const {
    complete,
    showLink,
    title,
  } = sequence;

  const coursewareUrl = <Link to={`/course/${courseId}/${id}`} className="text-gray-700">{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;

  const getDisplayIcon = () => {
    switch (MOCKED_TYPE) { // ToDo: should be refactored after API is ready
      case 'video':
        return complete ? <VideocamCompleteIcon /> : <VideocamIcon />;
      case 'problem':
        return complete ? <EditSquareCompleteIcon /> : <EditSquareIcon />;
      default:
        return complete ? <BookCompleteIcon /> : <BookIcon />;
    }
  };

  return (
    <li className={classNames({ 'bg-info-100': isActive, 'border-top border-light': !first })}>
      <div className="row w-100 m-0 d-flex align-items-center">
        <div className="col-auto p-0">
          {getDisplayIcon()}
        </div>
        <div className="col-10 p-0 ml-3 text-break">
          <span className="align-middle">
            {displayTitle}
          </span>
          <span className="sr-only">
            , {intl.formatMessage(complete ? messages.completedUnit : messages.incompleteUnit)}
          </span>
        </div>
      </div>
    </li>
  );
};

SidebarUnit.propTypes = {
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
  isActive: PropTypes.bool,
};

SidebarUnit.defaultProps = {
  isActive: false,
};

export default injectIntl(SidebarUnit);
