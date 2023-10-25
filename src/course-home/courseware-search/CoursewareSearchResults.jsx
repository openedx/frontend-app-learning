import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Folder, TextFields, VideoCamera, Article,
} from '@edx/paragon/icons';
import { Icon } from '@edx/paragon';
import PropTypes from 'prop-types';
import messages from './messages';

const iconTypeMapping = {
  document: Folder,
  text: TextFields,
  video: VideoCamera,
};
const defaultIcon = Article;

const CoursewareSearchResults = ({ intl, results }) => {
  if (!results?.length) {
    return (
      <div className="courseware-search-results">
        <p className="courseware-search-results__empty" data-testid="no-results">{intl.formatMessage(messages.searchResultsNone)}</p>
      </div>
    );
  }

  return (
    <div className="courseware-search-results" data-testid="search-results">
      {results.map(({
        title, href, type, breadcrumbs, contentMatches, isExternal,
      }) => {
        const key = type.toLowerCase();
        const icon = iconTypeMapping[key] || defaultIcon;

        const linkProps = { href };

        if (isExternal) {
          linkProps.target = '_blank';
          linkProps.rel = 'nofollow';
        }

        return (
          <a className="courseware-search-results__item" {...linkProps}>
            <div className="courseware-search-results__icon"><Icon src={icon} /></div>
            <div className="courseware-search-results__info">
              <div className="courseware-search-results__title">
                <span>{title}</span>
                {contentMatches ? (<em>{contentMatches}</em>) : null }
              </div>
              {breadcrumbs?.length ? (
                <ul className="courseware-search-results__breadcrumbs">
                  {breadcrumbs.map(bc => (<li><div>{bc}</div></li>))}
                </ul>
              ) : null}
            </div>
          </a>
        );
      })}
    </div>
  );
};

CoursewareSearchResults.propTypes = {
  intl: intlShape.isRequired,
  results: PropTypes.arrayOf(PropTypes.objectOf({
    title: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    type: PropTypes.string,
    breadcrumbs: PropTypes.arrayOf(PropTypes.string),
    contentMatches: PropTypes.number,
    isExternal: PropTypes.bool,
  })),
};

CoursewareSearchResults.defaultProps = {
  results: [],
};

export default injectIntl(CoursewareSearchResults);
