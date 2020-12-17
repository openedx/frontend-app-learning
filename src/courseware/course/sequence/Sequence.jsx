/* eslint-disable no-use-before-define */
import React, {
  useEffect, useContext, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  sendTrackEvent,
  sendTrackingLogEvent,
} from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { history } from '@edx/frontend-platform';

// These should be reverted after the REV1512 experiment
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import PageLoading from '../../../generic/PageLoading';
import { UserMessagesContext, ALERT_TYPES } from '../../../generic/user-messages';
import { useModel } from '../../../generic/model-store';

import CourseLicense from '../course-license';
import messages from './messages';
import { SequenceNavigation, UnitNavigation } from './sequence-navigation';
import SequenceContent from './SequenceContent';

function REV1512Flyover({ toggleREV1512Flyover }) {
  // This component should be reverted after the REV1512 experiment
  return (
    <div
      className="rev-1512-box"
      style={{
        border: 'solid 1px #e1dddb',
        height: '393px',
        width: '330px',
        verticalAlign: 'top',
        marginLeft: '20px',
        padding: '0 20px 20px 20px',
      }}
    >
      <div
        className="rev-1512-notification-div"
        style={{
          margin: '0 -20px 15px',
          padding: '9px 20px 0',
          fontSize: '16px',
        }}
      >
        <span className="rev-1512-notification-span">Notification</span>
        <svg
          onClick={toggleREV1512Flyover}
          className="hideFlyover"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            float: 'right',
            marginTop: '5.5px',
          }}
        >
          <path d="M9.60625 7L13.5152 3.09102C13.9949 2.61133 13.9949 1.83359 13.5152 1.35352L12.6465 0.484766C12.1668 0.00507814 11.3891 0.00507814 10.909 0.484766L7 4.39375L3.09102 0.484766C2.61133 0.00507814 1.83359 0.00507814 1.35352 0.484766L0.484766 1.35352C0.00507814 1.8332 0.00507814 2.61094 0.484766 3.09102L4.39375 7L0.484766 10.909C0.00507814 11.3887 0.00507814 12.1664 0.484766 12.6465L1.35352 13.5152C1.8332 13.9949 2.61133 13.9949 3.09102 13.5152L7 9.60625L10.909 13.5152C11.3887 13.9949 12.1668 13.9949 12.6465 13.5152L13.5152 12.6465C13.9949 12.1668 13.9949 11.3891 13.5152 10.909L9.60625 7Z" fill="black" />
        </svg>
        <div
          className="rev-1512-notification-block"
          style={{
            height: '9px',
            background: '#F9F9F9',
            margin: '7px -20px 0',
            borderTop: '1px solid rgb(225, 221, 219)',
            borderBottom: '1px solid rgb(225, 221, 219)',
          }}
        />
      </div>
    </div>
  );
}
REV1512Flyover.propTypes = {
  toggleREV1512Flyover: PropTypes.func.isRequired,
};

function REV1512FlyoverMobile({ toggleREV1512Flyover }) {
  // This component should be reverted after the REV1512 experiment
  return (
    <div
      className="rev-1512-box"
      style={{
        verticalAlign: 'top',
        padding: '0 20px 20px 20px',
        position: 'fixed',
        backgroundColor: 'white',
        zIndex: 1,
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
      }}
    >
      <div
        className="rev-1512-mobile-return-div"
        style={{
          margin: '0 -20px',
          padding: '9px 20px 15px',
          fontSize: '16px',
          borderBottom: '1px solid rgb(225, 221, 219)',
        }}
      >
        <span
          className="rev-1512-mobile-return-span"
          onClick={toggleREV1512Flyover}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              toggleREV1512Flyover();
            }
          }}
          role="button"
          tabIndex={0}
          style={{
            color: '#00262B',
          }}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="mr-2 fa-lg"
            style={{
              marginBottom: 2,
            }}
          />
          Back to course
        </span>
      </div>
      <div
        className="rev-1512-notification-div"
        style={{
          margin: '0 -20px 15px',
          padding: '9px 20px 0',
          fontSize: '16px',
        }}
      >
        <span
          className="rev-1512-notification-span"
          style={{
            color: '#00262B',
          }}
        >
          Notifications
        </span>
        <div
          className="rev-1512-notification-block"
          style={{
            height: '9px',
            background: '#F9F9F9',
            margin: '7px -20px 0',
            borderTop: '1px solid rgb(225, 221, 219)',
            borderBottom: '1px solid rgb(225, 221, 219)',
          }}
        />
      </div>
    </div>
  );
}
REV1512FlyoverMobile.propTypes = {
  toggleREV1512Flyover: PropTypes.func.isRequired,
};

function Sequence({
  unitId,
  sequenceId,
  courseId,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
  intl,
  isREV1512FlyoverVisible, /* This line should be reverted after the REV1512 experiment */
  REV1512FlyoverEnabled, /* This line should be reverted after the REV1512 experiment */
  toggleREV1512Flyover, /* This line should be reverted after the REV1512 experiment */
}) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const unit = useModel('units', unitId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  const handleNext = () => {
    const nextIndex = sequence.unitIds.indexOf(unitId) + 1;
    if (nextIndex < sequence.unitIds.length) {
      const newUnitId = sequence.unitIds[nextIndex];
      handleNavigate(newUnitId);
    } else {
      nextSequenceHandler();
    }
  };

  // These should be reverted after the REV1512 experiment:
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  const isMobile = Boolean(
    userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
  );

  const handlePrevious = () => {
    const previousIndex = sequence.unitIds.indexOf(unitId) - 1;
    if (previousIndex >= 0) {
      const newUnitId = sequence.unitIds[previousIndex];
      handleNavigate(newUnitId);
    } else {
      previousSequenceHandler();
    }
  };

  const handleNavigate = (destinationUnitId) => {
    unitNavigationHandler(destinationUnitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = sequence.unitIds.length > 0 ? sequence.unitIds.indexOf(unitId) : 0;
    const payload = {
      current_tab: currentIndex + 1,
      id: unitId,
      tab_count: sequence.unitIds.length,
      widget_placement: widgetPlacement,
    };
    if (targetUnitId) {
      const targetIndex = sequence.unitIds.indexOf(targetUnitId);
      payload.target_tab = targetIndex + 1;
    }
    sendTrackEvent(eventName, payload);
    sendTrackingLogEvent(eventName, payload);
  };

  const { add, remove } = useContext(UserMessagesContext);
  useEffect(() => {
    let id = null;
    if (sequenceStatus === 'loaded') {
      if (sequence.bannerText) {
        id = add({
          code: null,
          dismissible: false,
          text: sequence.bannerText,
          type: ALERT_TYPES.INFO,
          topic: 'sequence',
        });
      }
    }
    return () => {
      if (id) {
        remove(id);
      }
    };
  }, [sequenceStatus, sequence]);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };
  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [unit]);

  if (sequenceStatus === 'loading') {
    if (!sequenceId) {
      return (<div> {intl.formatMessage(messages['learn.sequence.no.content'])} </div>);
    }
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  /*
  TODO: When the micro-frontend supports viewing special exams without redirecting to the legacy
  experience, we can remove this whole conditional. For now, though, we show the spinner here
  because we expect CoursewareContainer to be performing a redirect to the legacy experience while
  we're waiting. That redirect may take a few seconds, so we show the spinner in the meantime.
  */
  if (sequenceStatus === 'loaded' && sequence.isTimeLimited) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  const gated = sequence && sequence.gatedContent !== undefined && sequence.gatedContent.gated;
  const goToCourseExitPage = () => {
    history.push(`/course/${courseId}/course-end`);
  };

  if (sequenceStatus === 'loaded') {
    return (
      <div>
        <div className="sequence-container" style={{ display: 'inline-flex', flexDirection: 'row' }}>
          <div className="sequence" style={{ width: '100%' }}>
            <SequenceNavigation
              sequenceId={sequenceId}
              unitId={unitId}
              className="mb-4"
              nextSequenceHandler={() => {
                logEvent('edx.ui.lms.sequence.next_selected', 'top');
                handleNext();
              }}
              onNavigate={(destinationUnitId) => {
                logEvent('edx.ui.lms.sequence.tab_selected', 'top', destinationUnitId);
                handleNavigate(destinationUnitId);
              }}
              previousSequenceHandler={() => {
                logEvent('edx.ui.lms.sequence.previous_selected', 'top');
                handlePrevious();
              }}
              goToCourseExitPage={() => goToCourseExitPage()}
            />
            <div className="unit-container flex-grow-1">
              <SequenceContent
                courseId={courseId}
                gated={gated}
                sequenceId={sequenceId}
                unitId={unitId}
                unitLoadedHandler={handleUnitLoaded}
              />
              {unitHasLoaded && (
              <UnitNavigation
                sequenceId={sequenceId}
                unitId={unitId}
                onClickPrevious={() => {
                  logEvent('edx.ui.lms.sequence.previous_selected', 'bottom');
                  handlePrevious();
                }}
                onClickNext={() => {
                  logEvent('edx.ui.lms.sequence.next_selected', 'bottom');
                  handleNext();
                }}
                goToCourseExitPage={() => goToCourseExitPage()}
              />
              )}
            </div>
          </div>
          {/* This block of code should be reverted post REV1512 experiment */}
          {REV1512FlyoverEnabled && isREV1512FlyoverVisible() && (
            isMobile
              ? <REV1512FlyoverMobile toggleREV1512Flyover={toggleREV1512Flyover} />
              : <REV1512Flyover toggleREV1512Flyover={toggleREV1512Flyover} />
          )}
        </div>
        <CourseLicense license={course.license || undefined} />
      </div>
    );
  }

  // sequence status 'failed' and any other unexpected sequence status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages['learn.course.load.failure'])}
    </p>
  );
}

Sequence.propTypes = {
  unitId: PropTypes.string,
  sequenceId: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  toggleREV1512Flyover: PropTypes.func.isRequired, /* This line should be reverted after the REV1512 experiment */
  isREV1512FlyoverVisible: PropTypes.func.isRequired, /* This line should be reverted after the REV1512 experiment */
  REV1512FlyoverEnabled: PropTypes.bool.isRequired, /* This line should be reverted after the REV1512 experiment */
};

Sequence.defaultProps = {
  sequenceId: null,
  unitId: null,
};

export default injectIntl(Sequence);
