import React, { useMemo } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Tabs, Tab } from '@edx/paragon';

import { useParams } from 'react-router';
import CoursewareSearchResults from './CoursewareSearchResults';
import messages from './messages';
import { useCoursewareSearchParams } from './hooks';
import { useModel } from '../../generic/model-store';

const filterAll = 'all';
const filterTypes = ['text', 'video', 'sequence'];
const filterOther = 'other';
const validFilters = [filterAll, ...filterTypes, filterOther];

export const CoursewareSearchResultsFilter = ({ intl }) => {
  const { courseId } = useParams();
  const lastSearch = useModel('contentSearchResults', courseId);
  const { filter: filterKeyword, setFilter } = useCoursewareSearchParams();

  if (!lastSearch) { return null; }

  const { results: data = [] } = lastSearch;

  if (!data.length) { return null; }

  const results = useMemo(() => {
    const grouped = data.reduce((acc, { type, ...rest }) => {
      const resultType = filterTypes.includes(type) ? type : filterOther;
      acc[filterAll].push({ type: resultType, ...rest });
      acc[resultType] = [...(acc[resultType] || []), { type: resultType, ...rest }];
      return acc;
    }, { [filterAll]: [] });

    // This is just to keep the tab order
    const output = {};
    validFilters.forEach(key => { if (grouped[key]) { output[key] = grouped[key]; } });

    return output;
  }, [lastSearch]);

  const tabKeys = Object.keys(results);
  // Filter has no use if it has only 2 tabs (The "all" tab and another one with the same items).
  if (tabKeys.length < 3) { return <CoursewareSearchResults results={results[filterAll]} />; }

  const filters = useMemo(() => tabKeys.map((key) => ({
    key,
    label: intl.formatMessage(messages[`filter:${key}`]),
    count: results[key].length,
  })), [results]);

  const activeKey = validFilters.includes(filterKeyword) ? filterKeyword : filterAll;

  return (
    <Tabs
      id="courseware-search-results-tabs"
      className="courseware-search-results-tabs"
      data-testid="courseware-search-results-tabs"
      variant="tabs"
      activeKey={activeKey}
      onSelect={setFilter}
    >
      {filters.filter(({ count }) => (count > 0)).map(({ key, label }) => (results[key].length ? (
        <Tab key={key} eventKey={key} title={label} data-testid={`courseware-search-results-tabs-${key}`}>
          <CoursewareSearchResults results={results[key]} />
        </Tab>
      ) : null))}
    </Tabs>
  );
};

CoursewareSearchResultsFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearchResultsFilter);
