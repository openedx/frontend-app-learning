import { useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible } from '@openedx/paragon';
import { CheckCircle as CheckCircleIcon } from '@openedx/paragon/icons';

import { useModel } from '../../../../../generic/model-store';
import courseOutlineMessages from '../../../../../course-home/outline-tab/messages';
import { getSequenceId } from '../../../../data/selectors';
import { CompletionSolidIcon } from './icons';
import SidebarUnit from './SidebarUnit';

const MOCKED_UNIT_IDS = ['123', '456', '789']; // ToDo: should be refactored after API is ready
const MOCKED_UNITS = {
  123: {
    complete: false,
    showLink: true,
    title: 'Test unit title 1',
  },
  456: {
    complete: true,
    showLink: true,
    title: 'Test unit title 2',
  },
  789: {
    complete: false,
    showLink: true,
    title: 'Test unit title 3',
  },
}; // ToDo: should be refactored after API is ready

const SidebarSequence = ({
  courseId,
  defaultOpen,
  intl,
  sequence,
}) => {
  const {
    id,
    complete,
    title,
    unitIds = MOCKED_UNIT_IDS,
  } = sequence;

  const {
    courseBlocks: { units = MOCKED_UNITS },
  } = useModel('outline', courseId);

  const [open, setOpen] = useState(defaultOpen);
  const activeSequenceId = useSelector(getSequenceId);

  const sectionTitle = (
    <>
      <div className="col-auto p-0" style={{ fontSize: '1.1rem' }}>
        {complete ? <CheckCircleIcon className="text-success" /> : <CompletionSolidIcon />}
      </div>
      <div className="col-auto flex-grow-1 ml-3 p-0 text-dark-500 text-left">
        <span className="align-middle">{title}</span>
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
        className={classNames('mb-2', { 'active-section': id === activeSequenceId })}
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
              sequence={units[unitId]}
              isActive={defaultOpen && index === 1} // ToDo: should be refactored after API is ready
              first={index === 0}
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
  sequence: PropTypes.shape().isRequired,
};

export default injectIntl(SidebarSequence);
