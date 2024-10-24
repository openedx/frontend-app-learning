import React from 'react';
import PropTypes from 'prop-types';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useSelector } from 'react-redux';

import { LOADED } from '@src/constants';
import { GetCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';

import messages from './messages';
import PreviousButton from './generic/PreviousButton';
import NextButton from './generic/NextButton';

const SequenceNavigation = ({
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextHandler,
  previousHandler,
  nextSequenceHandler,
  handleNavigate,
  isOpen,
  open,
  close,
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
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;

    return navigationDisabledNextSequence || (
      <PluginSlot
        id="next_button_slot"
        pluginProps={{
          courseId,
          disabled,
          buttonText: shouldDisplayNotificationTriggerInSequence ? null : buttonText,
          nextLink,
          sequenceId,
          unitId,
          nextSequenceHandler,
          handleNavigate,
          isOpen,
          open,
          close,
        }}
      >
        <NextButton
          variant="link"
          buttonStyle="next-btn"
          onClick={nextHandler}
          nextLink={nextLink}
          disabled={disabled}
          buttonLabel={shouldDisplayNotificationTriggerInSequence ? null : buttonText}
        />
      </PluginSlot>
    );
  };

  return sequenceStatus === LOADED && (
    <nav id="courseware-sequence-navigation" data-testid="courseware-sequence-navigation" className={classNames('sequence-navigation', className, { 'mr-2': shouldDisplayNotificationTriggerInSequence })}>
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
  close: PropTypes.func,
  open: PropTypes.func,
  isOpen: PropTypes.bool,
  handleNavigate: PropTypes.func,
  nextSequenceHandler: PropTypes.func,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
  close: null,
  open: null,
  isOpen: false,
  handleNavigate: null,
  nextSequenceHandler: null,
};

export default SequenceNavigation;
