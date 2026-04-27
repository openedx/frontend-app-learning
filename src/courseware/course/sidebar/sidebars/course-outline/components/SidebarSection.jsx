import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { ChevronRight as ChevronRightIcon } from '@openedx/paragon/icons';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import CompletionIcon from './CompletionIcon';
import { useCourseOutlineSidebar } from '../hooks';
import messages from '../messages';

const SidebarSection = ({ section, handleSelectSection, showOutlineEstimatedTime }) => {
  const intl = useIntl();
  const {
    id,
    complete,
    title,
    sequenceIds,
    completionStat,
    effortTime,
  } = section;

  const {
    activeSequenceId,
    sequences,
    units,
    modelSequences,
    modelUnits,
  } = useCourseOutlineSidebar();
  const isActiveSection = sequenceIds.includes(activeSequenceId);

  const getSequenceEffortSeconds = (sequenceId) => {
    const sequenceEffort = sequences[sequenceId]?.effortTime ?? modelSequences[sequenceId]?.effortTime;
    if (typeof sequenceEffort === 'number') {
      return sequenceEffort;
    }

    const sequenceUnitIds = sequences[sequenceId]?.unitIds || [];
    return sequenceUnitIds.reduce(
      (total, unitId) => total + (
        units[unitId]?.effortTime
        ?? modelUnits[unitId]?.effortTime
        ?? (typeof modelUnits[unitId]?.estimatedTimeMinutes === 'number'
          ? Math.ceil(modelUnits[unitId].estimatedTimeMinutes * 60)
          : 0)
      ),
      0,
    );
  };

  const sectionEffortTime = typeof effortTime === 'number'
    ? effortTime
    : sequenceIds.reduce(
      (total, sequenceId) => total + getSequenceEffortSeconds(sequenceId),
      0,
    );
  const minuteCount = sectionEffortTime > 0 ? Math.ceil(sectionEffortTime / 60) : 0;

  const sectionTitle = (
    <>
      <div className="col-auto p-0">
        <CompletionIcon completionStat={completionStat} />
      </div>
      <div className="col-10 ml-3 p-0 flex-grow-1 text-dark-500 text-left text-break">
        {title}
        {showOutlineEstimatedTime && minuteCount > 0 && (
          <span className="small text-gray-500 font-weight-normal ml-2">
            {intl.formatMessage(messages.estimatedTimeMinutesAbbreviated, { minuteCount })}
          </span>
        )}
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
    effortTime: PropTypes.number,
    completionStat: PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
    }),
  }).isRequired,
  handleSelectSection: PropTypes.func.isRequired,
  showOutlineEstimatedTime: PropTypes.bool,
};

SidebarSection.defaultProps = {
  showOutlineEstimatedTime: true,
};

export default SidebarSection;
