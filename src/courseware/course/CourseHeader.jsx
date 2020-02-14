import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import logo from './logo.svg';

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

export default function CourseHeader({
  courseOrg, courseNumber, courseName,
}) {
  const { authenticatedUser } = useContext(AppContext);

  return (
    <header className="border-bottom border-primary">
      <div className="container-fluid py-2 d-flex align-items-center ">
        <LinkedLogo
          className="logo"
          href={`${getConfig().LMS_BASE_URL}/dashboard`}
          src={logo}
          alt={getConfig().SITE_NAME}
        />
        <div className="flex-grow-1" style={{ lineHeight: 1 }}>
          <span className="d-block small m-0">{courseOrg} {courseNumber}</span>
          <span className="d-block m-0 font-weight-bold">{courseName}</span>
        </div>

        <Dropdown>
          <Dropdown.Button>
            {authenticatedUser.username}
          </Dropdown.Button>
          <Dropdown.Menu className="dropdown-menu-right">
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/dashboard`}>Dashboard</Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/u/${authenticatedUser.username}`}>Profile</Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/account/settings`}>Account</Dropdown.Item>
            <Dropdown.Item href={getConfig().ORDER_HISTORY_URL}>Order History</Dropdown.Item>
            <Dropdown.Item href={getConfig().LOGOUT_URL}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

CourseHeader.propTypes = {
  courseOrg: PropTypes.string.isRequired,
  courseNumber: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
};
