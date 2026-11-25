import PropTypes from 'prop-types';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import { useIntl } from '@openedx/frontend-base';

import { useSequenceMetadata } from '@src/courseware/data/apiHooks';
import { GetCourseExitNavigation } from '../../course-exit/utils';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';

import messages from './messages';
import PreviousButton from './generic/PreviousButton';
import NextUnitTopNavTriggerSlot from '@src/slots/NextUnitTopNavTriggerSlot';
import { useCourseId } from '@src/generic/course-params';

const SequenceNavigation = ({
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextHandler,
  previousHandler,
}) => {
  const intl = useIntl();
  const {
    isFirstUnit,
    isLastUnit,
    nextLink,
    previousLink,
    navigationDisabledPrevSequence,
    navigationDisabledNextSequence,
  } = useSequenceNavigationMetadata(sequenceId, unitId);
  const courseId = useCourseId();
  const sequenceQuery = useSequenceMetadata(sequenceId, { enabled: false });
  const sequence = sequenceQuery.data?.sequence;
  const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
  const isLocked = sequenceQuery.isSuccess ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;

  const isSmallScreen = useWindowSize().width < breakpoints.small.minWidth;

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} />
      );
    }
    if (sequence.unitIds.length === 0 || !unitId) {
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

  const renderPreviousButton = () => navigationDisabledPrevSequence || (
    <PreviousButton
      variant="link"
      buttonStyle="previous-btn"
      onClick={previousHandler}
      previousLink={previousLink}
      isFirstUnit={isFirstUnit}
      buttonLabel={isSmallScreen ? null : intl.formatMessage(messages.previousButton)}
    />
  );

  const renderNextButton = () => {
    let buttonText;
    const disabled = !nextLink || (isLastUnit && !exitActive);

    if (isLastUnit && exitText) {
      buttonText = exitText;
    } else if (!isSmallScreen) {
      buttonText = intl.formatMessage(messages.nextButton);
    }
    return navigationDisabledNextSequence || (
      <NextUnitTopNavTriggerSlot
        {...{
          disabled,
          buttonText,
          nextLink,
          sequenceId,
          onClickHandler: nextHandler,
          variant: 'link',
          buttonStyle: 'next-btn',
        }}
      />
    );
  };

  return sequenceQuery.isSuccess ? (
    <nav id="courseware-sequence-navigation" data-testid="courseware-sequence-navigation" className={classNames('sequence-navigation', className, { 'mr-2': isSmallScreen })}>
      {renderPreviousButton()}
      {renderUnitButtons()}
      {renderNextButton()}
    </nav>
  ) : null;
};

SequenceNavigation.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextHandler: PropTypes.func.isRequired,
  previousHandler: PropTypes.func.isRequired,
};

export default SequenceNavigation;
