import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function CourseBreadcrumb({ url, label, last }) {
  return (
    <React.Fragment key={`${label}-${url}`}>
      <li className="list-inline-item">
        {last ? label : (<a href={url}>{label}</a>)}
      </li>
      {!last &&
        <li className="list-inline-item" role="presentation" aria-label="spacer">
          <FontAwesomeIcon icon={faChevronRight} />
        </li>
      }
    </React.Fragment>
  );
}

CourseBreadcrumb.propTypes = {
  url: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  last: PropTypes.bool.isRequired,
};
