import React from 'react';
import PropTypes from 'prop-types';
import dompurify from 'dompurify';

const SanitizedHtmlFragment = ({
  className,
  html,
}) => {
  const markup = { __html: dompurify.sanitize(html) };

  return (
    <div className={className} dangerouslySetInnerHTML={markup} />
  );
};

SanitizedHtmlFragment.defaultProps = {
  className: '',
};

SanitizedHtmlFragment.propTypes = {
  className: PropTypes.string,
  html: PropTypes.string.isRequired,
};

export default SanitizedHtmlFragment;
