import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Icon, Spinner,
} from '@edx/paragon';
import {
  Close,
} from '@edx/paragon/icons';
import { setShowSearch } from '../data/slice';
import { useCoursewareSearchParams, useElementBoundingBox, useLockScroll } from './hooks';
import messages from './messages';

import CoursewareSearchForm from './CoursewareSearchForm';
import CoursewareSearchResultsFilterContainer from './CoursewareResultsFilter';
import { updateModel, useModel } from '../../generic/model-store';
import { searchCourseContent } from '../data/thunks';

const CoursewareSearch = ({ intl, ...sectionProps }) => {
  const { courseId } = useParams();
  const { query: searchKeyword, setQuery, clearSearchParams } = useCoursewareSearchParams();
  const dispatch = useDispatch();
  const { org } = useModel('courseHomeMeta', courseId);
  const {
    loading,
    searchKeyword: lastSearchKeyword,
    errors,
    total,
  } = useModel('contentSearchResults', courseId);

  useLockScroll();

  const info = useElementBoundingBox('courseTabsNavigation');
  const top = info ? `${Math.floor(info.top)}px` : 0;

  const clearSearch = () => {
    clearSearchParams();
    dispatch(updateModel({
      modelType: 'contentSearchResults',
      model: {
        id: courseId,
        searchKeyword: '',
        results: [],
        errors: undefined,
        loading: false,
      },
    }));
  };

  const handleSubmit = () => {
    if (!searchKeyword) {
      clearSearch();
      return;
    }

    sendTrackingLogEvent('edx.course.home.courseware_search.submit', {
      org_key: org,
      courserun_key: courseId,
      event_type: 'searchKeyword',
      keyword: searchKeyword,
    });

    dispatch(searchCourseContent(courseId, searchKeyword));
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  const handleOnChange = (value) => {
    if (value === searchKeyword) { return; }
    if (!value) {
      clearSearch();
      return;
    }

    setQuery(value);
  };

  const handleSearchCloseClick = () => {
    clearSearch();
    dispatch(setShowSearch(false));
  };

  let status = 'idle';
  if (loading) {
    status = 'loading';
  } else if (errors) {
    status = 'error';
  } else if (lastSearchKeyword) {
    status = 'results';
  }

  return (
    <section className="courseware-search" style={{ '--modal-top-position': top }} data-testid="courseware-search-section" {...sectionProps}>
      <div className="courseware-search__close">
        <Button
          variant="tertiary"
          className="p-1"
          aria-label={intl.formatMessage(messages.searchCloseAction)}
          onClick={handleSearchCloseClick}
          data-testid="courseware-search-close-button"
        ><Icon src={Close} />
        </Button>
      </div>
      <div className="courseware-search__outer-content">
        <div className="courseware-search__content">
          <h2>{intl.formatMessage(messages.searchModuleTitle)}</h2>
          <CoursewareSearchForm
            searchTerm={searchKeyword}
            onSubmit={handleSubmit}
            onChange={handleOnChange}
            placeholder={intl.formatMessage(messages.searchBarPlaceholderText)}
          />
          {status === 'loading' ? (
            <div className="courseware-search__spinner" data-testid="courseware-search-spinner">
              <Spinner animation="border" variant="light" screenReaderText={intl.formatMessage(messages.loading)} />
            </div>
          ) : null}
          {status === 'error' && (
            <Alert className="mt-4" variant="danger" data-testid="courseware-search-error">
              {intl.formatMessage(messages.searchResultsError)}
            </Alert>
          )}
          {status === 'results' ? (
            <>
              <div className="courseware-search__results-summary" data-testid="courseware-search-summary">{total > 0
                ? (
                  intl.formatMessage(
                    total === 1
                      ? messages.searchResultsSingular
                      : messages.searchResultsPlural,
                    { total, keyword: lastSearchKeyword },
                  )
                ) : intl.formatMessage(messages.searchResultsNone)}
              </div>
              <CoursewareSearchResultsFilterContainer />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

CoursewareSearch.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearch);
