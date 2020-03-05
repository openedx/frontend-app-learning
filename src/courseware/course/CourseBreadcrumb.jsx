import React from 'react';
import PropTypes from 'prop-types';

export default function CourseBreadcrumb({ url, label }) {
  return (
    <React.Fragment key={`${label}-${url}`}>
      <li className="list-inline-item text-gray-300" role="presentation" aria-label="spacer">
        /
      </li>
      <li className="list-inline-item">
        <a href={url}>{label}</a>
      </li>
    </React.Fragment>
  );
}

CourseBreadcrumb.propTypes = {
  url: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
