import React, { useMemo } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Tabs, Tab } from '@openedx/paragon';

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

  // If there's no data, we show an empty result.
  if (!data.length) { return <CoursewareSearchResults />; }

  const results = useMemo(() => {
    // This reducer distributes the data into different groups to make it easy to
    // use on the filters.
    // All results are added to the "all" key and then to its proper group key as well.
    const grouped = data.reduce((acc, { type, ...rest }) => {
      const resultType = filterTypes.includes(type) ? type : filterOther;
      acc[filterAll].push({ type: resultType, ...rest });
      acc[resultType] = [...(acc[resultType] || []), { type: resultType, ...rest }];
      return acc;
    }, { [filterAll]: [] });

    // This is just to format the output object with the expected tab order.
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
      {filters.filter(({ count }) => (count > 0)).map(({ key, label }) => (
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
