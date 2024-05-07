import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import {
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  LmsCompletionSolid as LmsCompletionSolidIcon,
} from '@openedx/paragon/icons';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getSequenceId } from '@src/courseware/data/selectors';

const SidebarSection = ({ intl, section, handleSelectSection }) => {
  const {
    id,
    complete,
    title,
    sequenceIds,
  } = section;

  const activeSequenceId = useSelector(getSequenceId);
  const isActiveSection = sequenceIds.includes(activeSequenceId);

  const sectionTitle = (
    <>
      <div className="col-auto p-0">
        {complete ? <CheckCircleIcon className="text-success" /> : <LmsCompletionSolidIcon className="text-gray-300" />}
      </div>
      <div className="col-10 ml-3 p-0 flex-grow-1 text-dark-500 text-left text-break">
        {title}
        <span className="sr-only">
          , {intl.formatMessage(complete
          ? courseOutlineMessages.completedSection
          : courseOutlineMessages.incompleteSection)}
        </span>
      </div>
    </>
  );

  return (
    <li className="mb-2 course-sidebar-section">
      <Button
        variant="tertiary"
        className={classNames(
          'd-flex align-items-center w-100 px-4 py-3.5 rounded-0 justify-content-start',
          { 'bg-info-100': isActiveSection },
        )}
        onClick={() => handleSelectSection(id)}
      >
        {sectionTitle}
        <Icon src={ChevronRightIcon} />
      </Button>
    </li>
  );
};

SidebarSection.propTypes = {
  intl: intlShape.isRequired,
  section: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    sequenceIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  handleSelectSection: PropTypes.func.isRequired,
};

export default injectIntl(SidebarSection);
