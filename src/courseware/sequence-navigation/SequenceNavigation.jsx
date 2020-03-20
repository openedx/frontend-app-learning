import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../model-store';

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

  return (
    <nav className={classNames('sequence-navigation', className)}>
      <Button className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        <FormattedMessage
          defaultMessage="Previous"
          id="learn.sequence.navigation.previous.button"
          description="The Previous button in the sequence nav"
        />
      </Button>

      {isLocked ? <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} /> : (
        <SequenceNavigationTabs
          unitIds={sequence.unitIds}
          unitId={unitId}
          showCompletion={sequence.showCompletion}
          onNavigate={onNavigate}
        />
      )}

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
  unitId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
};
