import PropTypes from 'prop-types';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import { LOADED } from '@src/constants';
import { GetCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';

import messages from './messages';
import PreviousButton from './generic/PreviousButton';
import { NextUnitTopNavTriggerSlot } from '../../../../plugin-slots/NextUnitTopNavTriggerSlot';

const SequenceNavigation = ({
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextHandler,
  previousHandler,
}) => {
  const intl = useIntl();
  const sequence = useModel('sequences', sequenceId);
  const {
    isFirstUnit,
    isLastUnit,
    nextLink,
    previousLink,
    navigationDisabledPrevSequence,
    navigationDisabledNextSequence,
  } = useSequenceNavigationMetadata(sequenceId, unitId);
  const {
    courseId,
    sequenceStatus,
  } = useSelector(state => state.courseware);
  const isLocked = sequenceStatus === LOADED ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;

  const shouldDisplayNotificationTriggerInSequence = useWindowSize().width < breakpoints.small.minWidth;

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} />
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

  const renderPreviousButton = () => navigationDisabledPrevSequence || (
    <PreviousButton
      variant="link"
      buttonStyle="previous-btn"
      onClick={previousHandler}
      previousLink={previousLink}
      isFirstUnit={isFirstUnit}
      buttonLabel={shouldDisplayNotificationTriggerInSequence ? null : intl.formatMessage(messages.previousButton)}
    />
  );

  const renderNextButton = () => {
    let buttonText;
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const disabled = isLastUnit && !exitActive;

    if (isLastUnit && exitText) {
      buttonText = exitText;
    } else if (!shouldDisplayNotificationTriggerInSequence) {
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

  return sequenceStatus === LOADED && (
    <nav
      id="courseware-sequenceNavigation"
      className={classNames('sequence-navigation', className)}
      style={{ width: shouldDisplayNotificationTriggerInSequence ? '90%' : null }}
      aria-label="course sequence tabs"
    >
      {renderPreviousButton()}
      {renderUnitButtons()}
      {renderNextButton()}
    </nav>
  );
};

SequenceNavigation.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextHandler: PropTypes.func.isRequired,
  previousHandler: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};

export default SequenceNavigation;
