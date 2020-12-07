import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown } from '@edx/paragon';
import { useEnterpriseConfig } from '@edx/frontend-enterprise';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';

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

function Header({
  courseOrg, courseNumber, courseTitle, intl,
}) {
  const { authenticatedUser } = useContext(AppContext);

  const { enterpriseLearnerPortalLink, enterpriseCustomerBrandingConfig } = useEnterpriseConfig(
    authenticatedUser,
    getConfig().ENTERPRISE_LEARNER_PORTAL_HOSTNAME,
    getConfig().LMS_BASE_URL,
  );

  let dashboardMenuItem = (
    <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/dashboard`}>
      {intl.formatMessage(messages.dashboard)}
    </Dropdown.Item>
  );
  if (enterpriseLearnerPortalLink && Object.keys(enterpriseLearnerPortalLink).length > 0) {
    dashboardMenuItem = (
      <Dropdown.Item
        href={enterpriseLearnerPortalLink.href}
      >
        {enterpriseLearnerPortalLink.content}
      </Dropdown.Item>
    );
  }

  let headerLogo = (
    <LinkedLogo
      className="logo"
      href={`${getConfig().LMS_BASE_URL}/dashboard`}
      src={getConfig().LOGO_URL}
      alt={getConfig().SITE_NAME}
    />
  );
  if (enterpriseCustomerBrandingConfig && Object.keys(enterpriseCustomerBrandingConfig).length > 0) {
    headerLogo = (
      <LinkedLogo
        className="logo"
        href={enterpriseCustomerBrandingConfig.logoDestination}
        src={enterpriseCustomerBrandingConfig.logo}
        alt={enterpriseCustomerBrandingConfig.logoAltText}
      />
    );
  }

  return (
    <header className="course-header">
      <div className="container-fluid py-2 d-flex align-items-center">
        {headerLogo}
        <div className="flex-grow-1 course-title-lockup" style={{ lineHeight: 1 }}>
          <span className="d-block small m-0">{courseOrg} {courseNumber}</span>
          <span className="d-block m-0 font-weight-bold course-title">{courseTitle}</span>
        </div>
        <a className="text-gray-700 mr-3" href={`${getConfig().SUPPORT_URL}`}>{intl.formatMessage(messages.help)}</a>
        <Dropdown className="user-dropdown">
          <Dropdown.Toggle variant="light">
            <FontAwesomeIcon icon={faUserCircle} className="d-md-none" size="lg" />
            <span data-hj-suppress className="d-none d-md-inline">
              {authenticatedUser.username}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-right">
            {dashboardMenuItem}
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/u/${authenticatedUser.username}`}>
              {intl.formatMessage(messages.profile)}
            </Dropdown.Item>
            <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/account/settings`}>
              {intl.formatMessage(messages.account)}
            </Dropdown.Item>
            {!enterpriseLearnerPortalLink && (
              // Users should only see Order History if they do not have an available
              // learner portal, because an available learner portal currently means
              // that they access content via Subscriptions, in which context an "order"
              // is not relevant.
              <Dropdown.Item href={getConfig().ORDER_HISTORY_URL}>
                {intl.formatMessage(messages.orderHistory)}
              </Dropdown.Item>
            )}
            <Dropdown.Item href={getConfig().LOGOUT_URL}>
              {intl.formatMessage(messages.signOut)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

Header.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  intl: intlShape.isRequired,
};

Header.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
};

export default injectIntl(Header);
