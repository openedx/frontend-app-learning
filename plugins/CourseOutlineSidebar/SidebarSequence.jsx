import { useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible } from '@openedx/paragon';
import { CheckCircle as CheckCircleIcon } from '@openedx/paragon/icons';

import { usePluginsSelector } from '@src/generic/plugin-store';
import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getSequenceId } from './data/selectors';
import { CompletionSolidIcon } from './icons';
import SidebarUnit from './SidebarUnit';
import { UNIT_ICON_TYPES } from './UnitIcon';
import { ID } from './constants';

const SidebarSequence = ({
  intl,
  courseId,
  defaultOpen,
  sequence,
  activeUnitId,
}) => {
  const {
    id,
    complete,
    title,
    specialExamInfo,
    unitIds,
    type,
  } = sequence;

  const [open, setOpen] = useState(defaultOpen);
  const { structure: courseOutlineStructure } = usePluginsSelector(ID);
  const { units = {} } = courseOutlineStructure;
  const activeSequenceId = useSelector(getSequenceId);

  const sectionTitle = (
    <>
      <div className="col-auto p-0" style={{ fontSize: '1.1rem' }}>
        {complete ? <CheckCircleIcon className="text-success" /> : <CompletionSolidIcon />}
      </div>
      <div className="col-9 d-flex flex-column flex-grow-1 ml-3 mr-auto p-0 text-left">
        <span className="align-middle text-dark-500">{title}</span>
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
        className={classNames('mb-2 text-break', { 'active-section': id === activeSequenceId })}
        styling="card-lg"
        title={sectionTitle}
        open={open}
        onToggle={() => setOpen(!open)}
      >
        <ol className="list-unstyled">
          {unitIds.map((unitId, index) => (
            <SidebarUnit
              key={unitId}
              id={unitId}
              courseId={courseId}
              sequenceId={id}
              unit={units[unitId]}
              isActive={activeUnitId === unitId}
              activeUnitId={activeUnitId}
              isFirst={index === 0}
              isLocked={type === UNIT_ICON_TYPES.lock}
            />
          ))}
        </ol>
      </Collapsible>
    </li>
  );
};

SidebarSequence.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool.isRequired,
  sequence: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    specialExamInfo: PropTypes.string,
    unitIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  activeUnitId: PropTypes.string.isRequired,
};

export default injectIntl(SidebarSequence);
