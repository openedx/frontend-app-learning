import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { ChevronRight as ChevronRightIcon } from '@openedx/paragon/icons';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import CompletionIcon from './CompletionIcon';
import { useCourseOutlineSidebar } from '../hooks';

const SidebarSection = ({ section, handleSelectSection }) => {
  const intl = useIntl();
  const {
    id,
    complete,
    title,
    sequenceIds,
    completionStat,
  } = section;

  const { activeSequenceId } = useCourseOutlineSidebar();
  const isActiveSection = sequenceIds.includes(activeSequenceId);

  const sectionTitle = (
    <>
      <div className="col-auto p-0">
        <CompletionIcon completionStat={completionStat} />
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
  section: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    sequenceIds: PropTypes.arrayOf(PropTypes.string),
    completionStat: PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
    }),
  }).isRequired,
  handleSelectSection: PropTypes.func.isRequired,
};

export default SidebarSection;
