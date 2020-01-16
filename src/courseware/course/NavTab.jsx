import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getConfig } from '@edx/frontend-platform';


export default function NavTab(props) {
  const {
    isActive, url, title, ...attrs
  } = props;

  const className = classNames(
    'nav-item nav-link',
    { active: isActive },
    attrs.className,
  );

  // TODO: We probably don't want to blindly add LMS_BASE_URL here.  I think it's more likely
  // that the course metadata API should provide us fully qualified URLs.
  return <a {...attrs} className={className} href={`${getConfig().LMS_BASE_URL}${url}`}>{title}</a>;
}

NavTab.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

NavTab.defaultProps = {
  className: undefined,
  isActive: false,
};
