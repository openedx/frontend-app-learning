import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useEnterpriseConfig } from '@edx/frontend-enterprise-utils';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import AnonymousUserMenu from './AnonymousUserMenu';
import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
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
  courseOrg, courseNumber, courseTitle, intl, showUserDropdown,
}) {
  const { authenticatedUser } = useContext(AppContext);

  const { enterpriseLearnerPortalLink, enterpriseCustomerBrandingConfig } = useEnterpriseConfig(
    authenticatedUser,
    getConfig().ENTERPRISE_LEARNER_PORTAL_HOSTNAME,
    getConfig().LMS_BASE_URL,
  );

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
      <a className="sr-only sr-only-focusable" href="#main-content">{intl.formatMessage(messages.skipNavLink)}</a>
      <div className="container-xl py-2 d-flex align-items-center">
        {headerLogo}
        <div className="flex-grow-1 course-title-lockup" style={{ lineHeight: 1 }}>
          <span className="d-block small m-0">{courseOrg} {courseNumber}</span>
          <span className="d-block m-0 font-weight-bold course-title">{courseTitle}</span>
        </div>
        {showUserDropdown && authenticatedUser && (
          <AuthenticatedUserDropdown
            enterpriseLearnerPortalLink={enterpriseLearnerPortalLink}
            username={authenticatedUser.username}
          />
        )}
        {showUserDropdown && !authenticatedUser && (
          <AnonymousUserMenu />
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  intl: intlShape.isRequired,
  showUserDropdown: PropTypes.bool,
};

Header.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
  showUserDropdown: true,
};

export default injectIntl(Header);
