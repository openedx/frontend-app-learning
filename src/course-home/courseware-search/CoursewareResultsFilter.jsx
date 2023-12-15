import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Tabs, Tab } from '@edx/paragon';

import { useParams } from 'react-router';
import CoursewareSearchResults from './CoursewareSearchResults';
import messages from './messages';
import { useCoursewareSearchParams } from './hooks';
import { useModel } from '../../generic/model-store';

const noFilterKey = 'none';
const noFilterLabel = 'All content';

export const filteredResultsBySelection = ({ key = noFilterKey, results = [] }) => (
  key === noFilterKey ? results : results.filter(({ type }) => type === key)
);

export const CoursewareSearchResultsFilter = ({ intl }) => {
  const { courseId } = useParams();
  const lastSearch = useModel('contentSearchResults', courseId);
  const { filter: filterKeyword, setFilter } = useCoursewareSearchParams();

  if (!lastSearch || !lastSearch?.results?.length) { return null; }

  const { total, results } = lastSearch;

  const filters = [
    {
      key: noFilterKey,
      label: noFilterLabel,
      count: total,
    },
    ...lastSearch.filters,
  ];

  const activeKey = filters.find(({ key }) => key === filterKeyword)?.key || noFilterKey;

  const getFilterTitle = (key, fallback) => {
    const msg = messages[`filter:${key}`];
    if (!msg) { return fallback; }
    return intl.formatMessage(msg);
  };

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
        <Tab key={key} eventKey={key} title={getFilterTitle(key, label)}>
          <CoursewareSearchResults
            results={filteredResultsBySelection({ key, results })}
          />
        </Tab>
      ))}
    </Tabs>
  );
};

CoursewareSearchResultsFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearchResultsFilter);
