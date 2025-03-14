import React, { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { ManageSearch } from '@openedx/paragon/icons';
import { useDispatch } from 'react-redux';
import messages from './messages';
import { useCoursewareSearchFeatureFlag, useCoursewareSearchParams } from './hooks';
import { setShowSearch } from '../data/slice';

const CoursewareSearchToggle = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const enabled = useCoursewareSearchFeatureFlag();
  const { query } = useCoursewareSearchParams();

  const handleSearchOpenClick = () => {
    dispatch(setShowSearch(true));
  };

  useEffect(() => {
    if (enabled && !!query) { handleSearchOpenClick(); }
  }, [enabled]);

  if (!enabled) { return null; }

  return (
    <div className="courseware-search-toggle">
      <Button
        variant="outline-primary"
        size="sm"
        className="p-1 mt-2 mr-2"
        aria-label={intl.formatMessage(messages.searchOpenAction)}
        onClick={handleSearchOpenClick}
        data-testid="courseware-search-open-button"
        iconAfter={ManageSearch}
      >
        {intl.formatMessage(messages.contentSearchButton)}
      </Button>
    </div>
  );
};

export default CoursewareSearchToggle;
