import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import {
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
} from '@openedx/paragon/icons';

import courseOutlineMessages from '../../../../../course-home/outline-tab/messages';
import { CompletionSolidIcon } from './icons';

const SidebarSection = ({ intl, section, handleSelectSection }) => {
  const {
    id,
    complete,
    title,
  } = section;

  const sectionTitle = (
    <>
      <div className="col-auto p-0">
        {complete ? <CheckCircleIcon className="text-success" /> : <CompletionSolidIcon />}
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
    <li className="mb-2 course-outline-sidebar-section">
      <Button
        variant="tertiary"
        className="d-flex align-items-center w-100 px-4 py-3.5 rounded-0 justify-content-start"
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
