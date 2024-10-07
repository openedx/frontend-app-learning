import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { breakpoints, Button, useWindowSize } from '@openedx/paragon';
import { ChevronLeft, ChevronRight } from '@openedx/paragon/icons';
import classNames from 'classnames';
import {
  injectIntl,
  intlShape,
  isRtl,
  getLocale,
} from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useSelector } from 'react-redux';

import { LOADED } from '@src/constants';
import { GetCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';

import messages from './messages';

const SequenceNavigation = ({
  intl,
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

  const renderPreviousButton = () => {
    const disabled = isFirstUnit;
    const prevArrow = isRtl(getLocale()) ? ChevronRight : ChevronLeft;
    return navigationDisabledPrevSequence || (
      <Button
        variant="link"
        className="previous-btn"
        onClick={previousHandler}
        disabled={disabled}
        iconBefore={prevArrow}
        as={disabled ? undefined : Link}
        to={disabled ? undefined : previousLink}
      >
        {shouldDisplayNotificationTriggerInSequence ? null : intl.formatMessage(messages.previousButton)}
      </Button>
    );
  };

  const renderNextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    const nextArrow = isRtl(getLocale()) ? ChevronLeft : ChevronRight;

    return navigationDisabledNextSequence || (
      <PluginSlot
        id="next_button_slot"
        pluginProps={{
          courseId,
          disabled,
          buttonText,
          nextArrow,
          nextLink,
          shouldDisplayNotificationTriggerInSequence,
          sequenceId,
          unitId,
          nextSequenceHandler,
          handleNavigate,
          isOpen,
          open,
          close,
          linkComponent: Link,
        }}
      >
        <Button
          variant="link"
          className="next-btn"
          onClick={nextHandler}
          disabled={disabled}
          iconAfter={nextArrow}
          as={disabled ? undefined : Link}
          to={disabled ? undefined : nextLink}
        >
          {shouldDisplayNotificationTriggerInSequence ? null : buttonText}
        </Button>
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
  intl: intlShape.isRequired,
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

export default injectIntl(SequenceNavigation);
