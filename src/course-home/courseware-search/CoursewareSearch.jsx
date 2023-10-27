import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import {
  Close,
} from '@edx/paragon/icons';
import { setShowSearch } from '../data/slice';
import { useElementBoundingBox, useLockScroll } from './hooks';
import messages from './messages';

import CoursewareSearchForm from './CoursewareSearchForm';
import CoursewareSearchResultsFilterContainer from './CoursewareResultsFilter';
import mockedData from './test-data/mockedResults';

const CoursewareSearch = ({ intl, ...sectionProps }) => {
  const [results, setResults] = useState();
  const dispatch = useDispatch();

  useLockScroll();

  const info = useElementBoundingBox('courseTabsNavigation');
  const top = info ? `${Math.floor(info.top)}px` : 0;

  const handleSubmit = (search) => {
    if (!search) {
      setResults(undefined);
      return;
    }

    setResults(search.toLowerCase() !== 'lorem ipsum' ? mockedData : []);
  };

  return (
    <section className="courseware-search" style={{ '--modal-top-position': top }} data-testid="courseware-search-section" {...sectionProps}>
      <div className="courseware-search__close">
        <Button
          variant="tertiary"
          className="p-1"
          aria-label={intl.formatMessage(messages.searchCloseAction)}
          onClick={() => dispatch(setShowSearch(false))}
          data-testid="courseware-search-close-button"
        ><Icon src={Close} />
        </Button>
      </div>
      <div className="courseware-search__outer-content">
        <div className="courseware-search__content">
          <h2>{intl.formatMessage(messages.searchModuleTitle)}</h2>
          <CoursewareSearchForm
            onSubmit={handleSubmit}
            placeholder={intl.formatMessage(messages.searchBarPlaceholderText)}
          />
          <CoursewareSearchResultsFilterContainer results={results} />
        </div>
      </div>
    </section>
  );
};

CoursewareSearch.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearch);
