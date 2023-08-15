import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { breakpoints, Button, useWindowSize } from '@edx/paragon';
import { ChevronLeft, ChevronRight } from '@edx/paragon/icons';
import classNames from 'classnames';
import {
  injectIntl,
  intlShape,
  isRtl,
  getLocale,
} from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { GetCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';

import messages from './messages';

const SequenceNavigation = ({
  intl,
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextHandler,
  previousHandler,
}) => {
  const sequence = useModel('sequences', sequenceId);
  const {
    isFirstUnit, isLastUnit, nextLink, previousLink,
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

    return (
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

    return (
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
    );
  };

  return sequenceStatus === LOADED && (
    <nav id="courseware-sequenceNavigation" className={classNames('sequence-navigation', className)} style={{ width: shouldDisplayNotificationTriggerInSequence ? '90%' : null }}>
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
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};

export default injectIntl(SequenceNavigation);
