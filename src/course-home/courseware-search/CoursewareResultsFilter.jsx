import React, { useMemo } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Tabs, Tab } from '@edx/paragon';

import { useParams } from 'react-router';
import CoursewareSearchResults from './CoursewareSearchResults';
import messages from './messages';
import { useCoursewareSearchParams } from './hooks';
import { useModel } from '../../generic/model-store';

const allFilterKey = 'all';
const otherFilterKey = 'other';
const allowedFilterKeys = {
  [allFilterKey]: true,
  text: true,
  video: true,
  sequence: true,
  [otherFilterKey]: true,
};

export const CoursewareSearchResultsFilter = ({ intl }) => {
  const { courseId } = useParams();
  const lastSearch = useModel('contentSearchResults', courseId);
  const { filter: filterKeyword, setFilter } = useCoursewareSearchParams();

  if (!lastSearch) { return null; }

  const { results: data = [] } = lastSearch;

  const results = useMemo(() => data.reduce((acc, { type, ...rest }) => {
    acc[allFilterKey] = [...(acc[allFilterKey] || []), { type: allFilterKey, ...rest }];
    if (type === allFilterKey) { return acc; }

    let targetKey = otherFilterKey;
    if (allowedFilterKeys[type]) { targetKey = type; }
    acc[targetKey] = [...(acc[targetKey] || []), { type: targetKey, ...rest }];
    return acc;
  }, {}), [data]);

  const filters = useMemo(() => Object.keys(allowedFilterKeys).map((key) => ({
    key,
    label: intl.formatMessage(messages[`filter:${key}`]),
    count: results[key]?.length || 0,
  })), [results]);

  const activeKey = allowedFilterKeys[filterKeyword] ? filterKeyword : allFilterKey;

  return (
    <Tabs
      id="courseware-search-results-tabs"
      className="courseware-search-results-tabs"
      data-testid="courseware-search-results-tabs"
      variant="tabs"
      activeKey={activeKey}
      onSelect={setFilter}
    >
      {filters.map(({ key, label }) => (
        <Tab key={key} eventKey={key} title={label} data-testid={`courseware-search-results-tabs-${key}`}>
          <CoursewareSearchResults results={results[key]} />
        </Tab>
      ))}
    </Tabs>
  );
};

CoursewareSearchResultsFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearchResultsFilter);
