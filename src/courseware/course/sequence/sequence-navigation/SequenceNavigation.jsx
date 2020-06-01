import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../model-store';

export default function SequenceNavigation({
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
}) {
  const sequence = useModel('sequences', sequenceId);
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const isLocked = sequence.gatedContent !== undefined && sequence.gatedContent.gated;
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <UnitButton unitId={unitId} title="" icon="lock" isActive onClick={() => {}} />
      );
    }
    if (sequence.unitIds.length === 0 || unitId === null) {
      return (
        <div style={{ flexBasis: '100%', minWidth: 0, borderBottom: 'solid 1px #EAEAEA' }} />
      );
    }
    return (
      <SequenceNavigationTabs
        unitIds={sequence.unitIds}
        unitId={unitId}
        showCompletion={sequence.showCompletion}
        onNavigate={onNavigate}
      />
    );
  };

  return sequenceStatus === 'loaded' && (
    <nav className={classNames('sequence-navigation', className)}>
      <Button className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        <FormattedMessage
          defaultMessage="Previous"
          id="learn.sequence.navigation.previous.button"
          description="The Previous button in the sequence nav"
        />
      </Button>
      {renderUnitButtons()}
      <Button className="next-btn" onClick={nextSequenceHandler} disabled={isLastUnit}>
        <FormattedMessage
          defaultMessage="Next"
          id="learn.sequence.navigation.next.button"
          description="The Next button in the sequence nav"
        />
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    </nav>
  );
}

SequenceNavigation.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};
