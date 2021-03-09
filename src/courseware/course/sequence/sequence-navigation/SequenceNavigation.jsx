import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { getCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';

import messages from './messages';
import { MMP2PFlyoverTriggerMobile } from '../../../../experiments/mm-p2p';

function SequenceNavigation({
  intl,
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
  goToCourseExitPage,
  toggleREV1512Flyover, /* This line should be reverted after the REV1512 experiment */
  REV1512FlyoverEnabled, /* This line should be reverted after the REV1512 experiment */
  isREV1512FlyoverVisible, /* This line should be reverted after the REV1512 experiment */
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const sequence = useModel('sequences', sequenceId);
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const {
    courseId,
    sequenceStatus,
  } = useSelector(state => state.courseware);
  const isLocked = sequenceStatus === LOADED ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;

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

  const renderNextButton = () => {
    const { exitActive, exitText } = getCourseExitNavigation(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : nextSequenceHandler;
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    return (
      <Button variant="link" className="next-btn" onClick={buttonOnClick} disabled={disabled}>
        {buttonText}
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    );
  };

  // These should be reverted after the REV1512 experiment
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  const isMobile = Boolean(
    userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
  );

  return sequenceStatus === LOADED && (
    <nav className={classNames('sequence-navigation', className)}>
      <Button variant="link" className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        {intl.formatMessage(messages.previousButton)}
      </Button>
      {renderUnitButtons()}
      {renderNextButton()}
      {!mmp2p.state.isEnabled && REV1512FlyoverEnabled
        && isMobile && (
        <div
          className="toggleFlyoverButton toggleFlyoverButtonMobile"
          aria-hidden="true"
          style={{ borderBottom: isREV1512FlyoverVisible() ? '2px solid #00262b' : 'none' }}
          onClick={() => {
            toggleREV1512Flyover();
          }}
        >
          <svg width="54" height="40" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="53" height="39" rx="1.5" fill="white" stroke="#E7E8E9" /><path d="M36 20C36 15.6 32.4 12 28 12C27.7 12 27.5 12.2 27.5 12.5C27.5 12.8 27.7 13 28 13C31.85 13 35 16.15 35 20C35 23.85 31.85 27 28 27C24.15 27 21 23.85 21 20C21 19.7 20.8 19.5 20.5 19.5C20.3 19.5 20.1 19.65 20.05 19.8C20 19.85 20 19.95 20 20C20 24.4 23.6 28 28 28C32.4 28 36 24.4 36 20Z" fill="black" stroke="black" strokeWidth="0.6" /><path d="M23.1065 14.52C22.9403 14.36 22.691 14.36 22.5247 14.52C22.3585 14.68 22.3585 14.92 22.5247 15.08C22.6078 15.16 22.7325 15.2 22.8156 15.2C22.9403 15.2 23.0234 15.16 23.1065 15.08C23.2312 14.96 23.2312 14.68 23.1065 14.52Z" fill="black" stroke="black" strokeWidth="0.6" /><path d="M27.6848 15.2C27.3939 15.2 27.2 15.3973 27.2 15.6932V19.6384C27.2 19.6877 27.2 19.7863 27.2484 19.8356C27.2969 19.8849 27.2969 19.9343 27.3454 19.9836L29.5757 22.2521C29.6727 22.3507 29.8181 22.4 29.9151 22.4C30.0121 22.4 30.1575 22.3507 30.2545 22.2521C30.4484 22.0548 30.4484 21.7589 30.2545 21.5617L28.1696 19.4411V15.6932C28.1696 15.3973 27.9757 15.2 27.6848 15.2Z" fill="black" stroke="black" strokeWidth="0.6" /><circle cx="35.5" cy="14.5" r="4.5" fill="#C32D3A" />
          </svg>
        </div>
      )}
      { mmp2p.state.isEnabled && <MMP2PFlyoverTriggerMobile options={mmp2p} /> }
      <div className="rev1512ToggleFlyoverSequenceLocation" />
    </nav>
  );
}

SequenceNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
  toggleREV1512Flyover: PropTypes.func.isRequired, /* This line should be reverted after the REV1512 experiment */
  REV1512FlyoverEnabled: PropTypes.bool.isRequired, /* This line should be reverted after the REV1512 experiment */
  isREV1512FlyoverVisible: PropTypes.func.isRequired, /* This line should be reverted after the REV1512 experiment */

  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
    }),
  }),
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,

  /** [MM-P2P] Experiment */
  mmp2p: {
    state: { isEnabled: false },
  },
};

export default injectIntl(SequenceNavigation);
