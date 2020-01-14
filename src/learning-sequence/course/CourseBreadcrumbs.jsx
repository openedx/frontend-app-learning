import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function CourseBreadcrumbs({ links }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="list-inline">
        {links.map(({ id, url, label }, i) => (
          <CourseBreadcrumb key={id} url={url} label={label} last={i === links.length - 1} />
          ))}
      </ol>
    </nav>
  );
}

CourseBreadcrumbs.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
};

function CourseBreadcrumb({ url, label, last }) {
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
