import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Tabs, Tab } from '@edx/paragon';

import CoursewareSearchResultPropType from './CoursewareSearchResult.PropTypeDefinition';
// TODO IN KBK-44: import CoursewareSearchResults from "./CoursewareSearchResults"

export const filteredResultsBySelection = ({ filterKey = 'all', results = [] }) => {
  if (['document', 'video', 'text'].includes(filterKey)) {
    return results.filter(result => result?.type?.toLowerCase() === filterKey);
  }

  return results;
};

const tabConfiguration = [
  { eventKey: 'all', title: 'All content' },
  { eventKey: 'course_outline', title: 'Course outline' },
  { eventKey: 'text', title: 'Text' },
  { eventKey: 'video', title: 'Video' },
];

// TODO: remove comment on next line once KBK-44 is available
export const CoursewareSearchResultsFilter = ({ intl, results }) => { // eslint-disable-line no-unused-vars
  if (!results || !results.length) { return null; }

  return (
    <Tabs id="courseware-search-results-tabs" data-testid="courseware-search-results-tabs" variant="tabs" defaultActiveKey="all">
      {tabConfiguration.map((tab) => (
        <Tab {...tab} key={tab.eventKey}>
          {/* <CoursewareSearchResults
              intl={intl}
              results={filteredResultsBySelection({ filterKey: tab.eventKey, results })}
            /> */}
        </Tab>
      ))}
    </Tabs>
  );
};

CoursewareSearchResultsFilter.propTypes = {
  intl: intlShape.isRequired,
  results: PropTypes.arrayOf(CoursewareSearchResultPropType),
};

CoursewareSearchResultsFilter.defaultProps = {
  results: [],
};

export default injectIntl(CoursewareSearchResultsFilter);
