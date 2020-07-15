/**
 * Mocks `@fortawesome/react-fontawesome.js` to return a simple <img> element containing `data-testid` attribute.
 * This way we can check whether the icon matches without relying on its internal implementation
 * and avoid storing its <svg> content in the snapshot tests.
 */
import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line no-use-before-define
FontAwesomeIcon.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      icon: PropTypes.arrayOf(PropTypes.any),
    }),
  ]).isRequired,
};

// eslint-disable-next-line import/prefer-default-export
export function FontAwesomeIcon(props) {
  const { icon } = props;

  let iconName;
  if (typeof icon === 'string') {
    iconName = icon;
  } else {
    iconName = `fa-${icon.iconName}`;
  }

  // eslint-disable-next-line react/jsx-filename-extension
  return <svg data-testid="icon" className={iconName} />;
}
