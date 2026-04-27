import { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible } from '@openedx/paragon';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { useCourseOutlineSidebar } from '../hooks';
import messages from '../messages';
import CompletionIcon from './CompletionIcon';
import SidebarUnit from './SidebarUnit';
import { UNIT_ICON_TYPES } from './UnitIcon';

const SidebarSequence = ({
  courseId,
  defaultOpen,
  sequence,
  activeUnitId,
  showOutlineEstimatedTime,
}) => {
  const intl = useIntl();
  const {
    id,
    complete,
    title,
    specialExamInfo,
    unitIds,
    type,
    completionStat,
    effortTime,
  } = sequence;

  const [open, setOpen] = useState(defaultOpen);
  const {
    activeSequenceId,
    units,
    modelSequences,
    modelUnits,
  } = useCourseOutlineSidebar();
  const isActiveSequence = id === activeSequenceId;
  // Calculate section effort time by first checking if the section has an explicit effort time.
  const sequenceEffortTime = typeof effortTime === 'number'
    ? effortTime
    : (typeof modelSequences[id]?.effortTime === 'number'
      ? modelSequences[id].effortTime
      : unitIds.reduce(
        (total, unitId) => total + (
          units[unitId]?.effortTime
          ?? modelUnits[unitId]?.effortTime
          ?? (typeof modelUnits[unitId]?.estimatedTimeMinutes === 'number'
            ? Math.ceil(modelUnits[unitId].estimatedTimeMinutes * 60)
            : 0)
        ),
        0,
      ));
  const minuteCount = sequenceEffortTime > 0 ? Math.ceil(sequenceEffortTime / 60) : 0;

  const sectionTitle = (
    <>
      <div className="col-auto p-0" style={{ fontSize: '1.1rem' }}>
        <CompletionIcon completionStat={completionStat} />
      </div>
      <div className="col-9 d-flex flex-column flex-grow-1 ml-3 mr-auto p-0 text-left">
        <span className="align-middle text-dark-500">
          {title}
          {showOutlineEstimatedTime && minuteCount > 0 && (
            <span className="small text-gray-500 font-weight-normal ml-2">
              {intl.formatMessage(messages.estimatedTimeMinutesAbbreviated, { minuteCount })}
            </span>
          )}
        </span>
        {specialExamInfo && <span className="align-middle small text-muted">{specialExamInfo}</span>}
        <span className="sr-only">
          , {intl.formatMessage(complete
          ? courseOutlineMessages.completedAssignment
          : courseOutlineMessages.incompleteAssignment)}
        </span>
      </div>
    </>
  );

  return (
    <li>
      <Collapsible
        className={classNames('mb-2', { 'active-section': isActiveSequence, 'bg-info-100': isActiveSequence && !open })}
        styling="card-lg text-break"
        title={sectionTitle}
        open={open}
        onToggle={() => setOpen(!open)}
      >
        <ol className="list-unstyled">
          {/* Map over the sequence's units, pulling relevant data from both the outline and model to pass down to the SidebarUnit component */}
          {unitIds.map((unitId, index) => {
            const outlineUnit = units[unitId] || {};
            const modelUnit = modelUnits[unitId] || {};
            const resolvedEffortTime = typeof outlineUnit.effortTime === 'number'
              ? outlineUnit.effortTime
              : modelUnit.effortTime;
            const resolvedEstimatedTimeMinutes = typeof outlineUnit.estimatedTimeMinutes === 'number'
              ? outlineUnit.estimatedTimeMinutes
              : modelUnit.estimatedTimeMinutes;

            return (
              <SidebarUnit
                key={unitId}
                id={unitId}
                courseId={courseId}
                sequenceId={id}
                unit={{
                  ...modelUnit,
                  ...outlineUnit,
                  effortTime: resolvedEffortTime,
                  estimatedTimeMinutes: resolvedEstimatedTimeMinutes,
                }}
                isActive={activeUnitId === unitId}
                activeUnitId={activeUnitId}
                isFirst={index === 0}
                isLocked={type === UNIT_ICON_TYPES.lock}
                showOutlineEstimatedTime={showOutlineEstimatedTime}
              />
            );
          })}
        </ol>
      </Collapsible>
    </li>
  );
};

SidebarSequence.propTypes = {
  courseId: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool.isRequired,
  sequence: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    specialExamInfo: PropTypes.string,
    unitIds: PropTypes.arrayOf(PropTypes.string),
    effortTime: PropTypes.number,
    completionStat: PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
    }),
  }).isRequired,
  activeUnitId: PropTypes.string.isRequired,
  showOutlineEstimatedTime: PropTypes.bool,
};

// Show the estimated time for sequences in the sidebar by default
SidebarSequence.defaultProps = {
  showOutlineEstimatedTime: true,
};

export default SidebarSequence;
