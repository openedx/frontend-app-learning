import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { useEnterpriseConfig } from '@edx/frontend-enterprise';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

import logo from './assets/logo.svg';

function LinkedLogo({
  href,
  src,
  alt,
  ...attributes
}) {
  return (
    <a href={href} {...attributes}>
      <img className="d-block" src={src} alt={alt} />
    </a>
  );
}

LinkedLogo.propTypes = {
  href: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default function Header({
  courseOrg, courseNumber, courseTitle,
}) {
  const { authenticatedUser } = useContext(AppContext);

  const { enterpriseLearnerPortalLink } = useEnterpriseConfig(
    authenticatedUser,
    getConfig().ENTERPRISE_LEARNER_PORTAL_HOSTNAME,
    getConfig().LMS_BASE_URL,
  );

  return (
    <header className="course-header">
      <div className="container-fluid py-2 d-flex align-items-center ">
        <LinkedLogo
          className="logo"
          href={`${getConfig().LMS_BASE_URL}/dashboard`}
          src={logo}
          alt={getConfig().SITE_NAME}
        />
        <div className="flex-grow-1 course-title-lockup" style={{ lineHeight: 1 }}>
          <span className="d-block small m-0">{courseOrg} {courseNumber}</span>
          <span className="d-block m-0 font-weight-bold course-title">{courseTitle}</span>
        </div>

        <Dropdown className="user-dropdown">
          <Dropdown.Toggle variant="light">
            <FontAwesomeIcon icon={faUserCircle} className="d-md-none" size="lg" />
            <span className="d-none d-md-inline">
              {authenticatedUser.username}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-right">
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/dashboard`}>Dashboard</Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/u/${authenticatedUser.username}`}>Profile</Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/account/settings`}>Account</Dropdown.Item>
            <Dropdown.Item href={getConfig().ORDER_HISTORY_URL}>Order History</Dropdown.Item>
            <Dropdown.Item href={getConfig().LOGOUT_URL}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* <Dropdown className="user-dropdown">
          <Dropdown.Button>
            <FontAwesomeIcon icon={faUserCircle} className="d-md-none" size="lg" />
            <span className="d-none d-md-inline">
              {authenticatedUser.username}
            </span>
          </Dropdown.Button>
          <Dropdown.Menu className="dropdown-menu-right">
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/dashboard`}>Dashboard</Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/u/${authenticatedUser.username}`}>Profile</Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/account/settings`}>Account</Dropdown.Item>
            { !enterpriseLearnerPortalLink
              // Users should only see Order History if they do not have an available
              // learner portal, because an available learner portal currently means
              // that they access content via Subscriptions, in which context an "order"
              // is not relevant.
              && <Dropdown.Item href={getConfig().ORDER_HISTORY_URL}>Order History</Dropdown.Item>}
            <Dropdown.Item href={getConfig().LOGOUT_URL}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}
      </div>
    </header>
  );
}

Header.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
};

Header.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
};
