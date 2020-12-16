import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { AlertList } from '../../generic/user-messages';
import useAccessExpirationAlert from '../../alerts/access-expiration-alert';
import useOfferAlert from '../../alerts/offer-alert';

import Sequence from './sequence';

import { CelebrationModal, shouldCelebrateOnSectionLoad } from './celebration';
import ContentTools from './content-tools';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import CourseSock from '../../generic/course-sock';
import { useModel } from '../../generic/model-store';

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
}) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);

  const {
    accessExpiration,
    canShowUpgradeSock,
    celebrations,
    offer,
    userTimezone,
    verifiedMode,
  } = course;

  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const offerAlert = useOfferAlert(offer, userTimezone, 'course');
  const accessExpirationAlert = useAccessExpirationAlert(accessExpiration, userTimezone, 'course');

  const dispatch = useDispatch();
  const celebrateFirstSection = celebrations && celebrations.firstSection;
  const celebrationOpen = shouldCelebrateOnSectionLoad(courseId, sequenceId, unitId, celebrateFirstSection, dispatch);

  // The below block of code should be reverted after the REV1512 experiment
  const [REV1512FlyoverEnabled, setREV1512FlyoverEnabled] = useState(false);
  window.enableREV1512Flyover = () => {
    setREV1512FlyoverEnabled(true);
  };
  const getCookie = (name) => {
    const match = document.cookie.match(`${name}=([^;]*)`);
    return match ? match[1] : undefined;
  };
  const [REV1512FlyoverVisible, setREV1512FlyoverVisible] = useState(getCookie('REV1512FlyoverVisible') === 'true');
  const isREV1512FlyoverVisible = () => REV1512FlyoverEnabled && (REV1512FlyoverVisible || getCookie('REV1512FlyoverVisible') === 'true');
  const toggleREV1512Flyover = () => {
    const setCookie = (cookieName, value, domain, exdays) => {
      const cookieDomain = (typeof domain === 'undefined') ? '' : `domain=${domain};`;
      const exdate = new Date();
      exdate.setDate(exdate.getDate() + exdays);
      const cookieValue = escape(value) + ((exdays == null) ? '' : `; expires=${exdate.toUTCString()}`);
      document.cookie = `${cookieName}=${cookieValue};${cookieDomain}path=/`;
    };
    const isVisible = isREV1512FlyoverVisible();
    setCookie('REV1512FlyoverVisible', !isVisible);
    setREV1512FlyoverVisible(!isVisible);
  };
  // The above block of code should be reverted after the REV1512 experiment

  return (
    <>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <AlertList
        className="my-3"
        topic="course"
        customAlerts={{
          ...accessExpirationAlert,
          ...offerAlert,
        }}
      />
      <CourseBreadcrumbs
        courseId={courseId}
        sectionId={section ? section.id : null}
        sequenceId={sequenceId}
        toggleREV1512Flyover={toggleREV1512Flyover} /* This line should be reverted after REV1512 experiment */
        REV1512FlyoverEnabled={REV1512FlyoverEnabled} /* This line should be reverted after REV1512 experiment */
      />
      <AlertList topic="sequence" />
      <Sequence
        unitId={unitId}
        sequenceId={sequenceId}
        courseId={courseId}
        unitNavigationHandler={unitNavigationHandler}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
        toggleREV1512Flyover={toggleREV1512Flyover} /* This line should be reverted after REV1512 experiment */
        isREV1512FlyoverVisible={isREV1512FlyoverVisible} /* This line should be reverted after REV1512 experiment */
        REV1512FlyoverEnabled={REV1512FlyoverEnabled} /* This line should be reverted after REV1512 experiment */
      />
      {celebrationOpen && (
        <CelebrationModal
          courseId={courseId}
          open
        />
      )}
      {canShowUpgradeSock && <CourseSock verifiedMode={verifiedMode} />}
      <ContentTools course={course} />
    </>
  );
}

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

export default Course;
