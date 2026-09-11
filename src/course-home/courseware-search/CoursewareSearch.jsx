import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Icon, Spinner,
} from '@openedx/paragon';
import {
  Close,
} from '@openedx/paragon/icons';
import { useCoursewareSearch } from './CoursewareSearchContext';
import {
  useCoursewareSearchFeatureFlag, useCoursewareSearchParams, useElementBoundingBox, useLockScroll,
} from './hooks';
import messages from './messages';

import CoursewareSearchForm from './CoursewareSearchForm';
import CoursewareSearchResultsFilterContainer from './CoursewareResultsFilter';
import { useModel } from '../../generic/model-store';
import { useCoursewareSearchResults } from './data/apiHooks';

const CoursewareSearchModal = ({ ...sectionProps }) => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();
  const { query: searchKeyword, setQuery, clearSearchParams } = useCoursewareSearchParams();
  const { close: closeSearch } = useCoursewareSearch();
  const { org } = useModel('courseHomeMeta', courseId);
  const {
    data, isLoading, isError,
  } = useCoursewareSearchResults(courseId, searchKeyword);
  const total = data?.total;
  const dialogRef = useRef();

  useLockScroll();

  const info = useElementBoundingBox('courseTabsNavigation');
  const top = info ? `${Math.floor(info.top)}px` : 0;

  const clearSearch = () => {
    clearSearchParams();
  };

  const handleSubmit = (value) => {
    if (!value) {
      clearSearch();
      return;
    }

    sendTrackingLogEvent('edx.course.home.courseware_search.submit', {
      org_key: org,
      courserun_key: courseId,
      event_type: 'searchKeyword',
      keyword: value,
    });

    setQuery(value);
  };

  const handleOnChange = (value) => {
    if (value === searchKeyword) { return; }
    if (!value) { clearSearch(); }
  };

  const close = () => {
    clearSearch();
    closeSearch();
  };

  const handlePopState = () => close();

  const handleBackdropClick = function (event) {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  useEffect(() => {
    // We need this to keep the dialog reference when unmounting.
    const dialog = dialogRef.current;

    // Open the dialog as a modal on render to confine focus within it.
    dialogRef.current.showModal();

    if (searchKeyword) {
      handleSubmit(searchKeyword); // In case it's opened with a search link, we run the search.
    }

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener('popstate', handlePopState, { signal });
    dialog.addEventListener('click', handleBackdropClick, { signal });

    return () => controller.abort(); // Removes event listeners.
  }, []);

  const handleSearchClose = () => close();

  let status = 'idle';
  if (isLoading) {
    status = 'loading';
  } else if (isError) {
    status = 'error';
  } else if (data) {
    status = 'results';
  }

  return (
    <dialog ref={dialogRef} className="courseware-search" style={{ '--modal-top-position': top }} data-testid="courseware-search-dialog" onClose={handleSearchClose} {...sectionProps}>
      <div className="courseware-search__outer-content">
        <div className="courseware-search__content" data-testid="courseware-search-content">
          <div className="courseware-search__form">
            <h1 className="h2" id="courseware-search-title">{formatMessage(messages.searchModuleTitle)}</h1>
            <CoursewareSearchForm
              searchTerm={searchKeyword}
              onSubmit={handleSubmit}
              onChange={handleOnChange}
              placeholder={formatMessage(messages.searchBarPlaceholderText)}
              labelledBy="courseware-search-title"
            />
            <div className="courseware-search__close">
              <Button
                variant="tertiary"
                className="p-1"
                aria-label={formatMessage(messages.searchCloseAction)}
                onClick={() => dialogRef.current.close()}
                data-testid="courseware-search-close-button"
              ><Icon src={Close} />
              </Button>
            </div>
          </div>
          <div className="courseware-search__results" aria-live="polite" data-testid="courseware-search-results">
            {status === 'loading' ? (
              <div className="courseware-search__spinner" data-testid="courseware-search-spinner">
                <Spinner animation="border" variant="light" screenReaderText={formatMessage(messages.loading)} />
              </div>
            ) : null}
            {status === 'error' && (
              <Alert className="mt-4" variant="danger" data-testid="courseware-search-error">
                {formatMessage(messages.searchResultsError)}
              </Alert>
            )}
            {status === 'results' ? (
              <>
                {total > 0 ? (
                  <div
                    className="courseware-search__results-summary"
                    aria-relevant="all"
                    aria-atomic="true"
                    data-testid="courseware-search-summary"
                  >{formatMessage(messages.searchResultsLabel, { total, keyword: searchKeyword })}
                  </div>
                ) : null}
                <CoursewareSearchResultsFilterContainer />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
};

const CoursewareSearch = (props) => {
  const { show } = useCoursewareSearch();
  const enabled = useCoursewareSearchFeatureFlag();

  if (!enabled || !show) { return null; }

  return <CoursewareSearchModal {...props} />;
};

export default CoursewareSearch;
