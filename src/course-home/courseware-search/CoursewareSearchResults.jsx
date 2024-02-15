import React from 'react';
import {
  Folder, TextFields, VideoCamera, Article,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { Icon } from '@openedx/paragon';
import PropTypes from 'prop-types';
import CoursewareSearchEmpty from './CoursewareSearchEmpty';

const iconTypeMapping = {
  text: TextFields,
  video: VideoCamera,
  sequence: Folder,
  other: Article,
};

const defaultIcon = Article;

const CoursewareSearchResults = ({ results = [] }) => {
  if (!results?.length) {
    return <CoursewareSearchEmpty />;
  }

  const baseUrl = `${getConfig().LMS_BASE_URL}`;

  return (
    <div className="courseware-search-results" data-testid="search-results">
      {results.map(({
        id,
        title,
        type,
        location,
        url,
        contentHits,
      }) => {
        const key = type.toLowerCase();
        const icon = iconTypeMapping[key] || defaultIcon;
        const isExternal = !url.startsWith('/');
        const linkProps = isExternal ? {
          href: url,
          target: '_blank',
          rel: 'nofollow',
        } : { href: `${baseUrl}${url}` };

        return (
          <a key={id} className="courseware-search-results__item" {...linkProps}>
            <div className="courseware-search-results__icon"><Icon src={icon} /></div>
            <div className="courseware-search-results__info">
              <div className="courseware-search-results__title">
                <span>{title}</span>
                {contentHits ? (<em>{contentHits}</em>) : null }
              </div>
              {location?.length ? (
                <ul className="courseware-search-results__breadcrumbs">
                  {
                  // This ignore is necessary because the breadcrumb texts might have duplicates.
                  // The breadcrumbs are not expected to change.
                  // eslint-disable-next-line react/no-array-index-key
                  location.map((breadcrumb, i) => (<li key={`${i}:${breadcrumb}`}><div>{breadcrumb}</div></li>))
                  }
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
  results: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    location: PropTypes.arrayOf(PropTypes.string),
    url: PropTypes.string,
    contentHits: PropTypes.number,
  })),
};

CoursewareSearchResults.defaultProps = {
  results: [],
};

export default CoursewareSearchResults;
