import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


export default function NavTab(props) {
  const {
    isActive, url, title, ...attrs
  } = props;

  const className = classNames(
    'nav-item nav-link',
    { active: isActive },
    attrs.className,
  );

  return <a {...attrs} className={className} href={url}>{title}</a>;
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
