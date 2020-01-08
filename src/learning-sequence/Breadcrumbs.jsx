import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Breadcrumbs = ({
  links, activeLabel, spacer, clickHandler,
}) => {
  const linkCount = links.length;

  return (
    <nav aria-label="breadcrumb">
      <ol className="list-inline">
        {links.map(({ url, label }, i) => (
          <React.Fragment key={`${label}-${url}`}>
            <li className="list-inline-item">
              <a href={url} {...(clickHandler && { onClick: clickHandler })}>{label}</a>
            </li>
            {(activeLabel || ((i + 1) < linkCount)) &&
              <li className="list-inline-item" role="presentation" aria-label="spacer">
                {spacer || <FontAwesomeIcon icon={faChevronRight} />}
              </li>
            }
          </React.Fragment>
        ))}
        {activeLabel && <li className="list-inline-item">{activeLabel}</li>}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  /** an array of objects with the properties `label` and `url` as strings. */
  links: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,
  /** allows to add a label that is not a link to the end of the breadcrumb.
   * Defaults to `undefined`.
 */
  activeLabel: PropTypes.string,
  /** allows to add a custom element between the breadcrumb items.
   * Defaults to `>` rendered using the `Icon` component. */
  spacer: PropTypes.element,
  /** allows to add a custom function to be called `onClick` of a breadcrumb link.
   * The use case for this is for adding custom analytics to the component. */
  clickHandler: PropTypes.func,
};

Breadcrumbs.defaultProps = {
  activeLabel: undefined,
  spacer: undefined,
  clickHandler: undefined,
};

export default Breadcrumbs;
