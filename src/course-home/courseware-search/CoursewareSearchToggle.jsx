import React, { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { ManageSearch } from '@openedx/paragon/icons';
import messages from './messages';
import { useCoursewareSearchFeatureFlag, useCoursewareSearchParams } from './hooks';
import { useCoursewareSearch } from './CoursewareSearchContext';

const CoursewareSearchToggle = () => {
  const intl = useIntl();
  const { open } = useCoursewareSearch();
  const enabled = useCoursewareSearchFeatureFlag();
  const { query } = useCoursewareSearchParams();

  useEffect(() => {
    if (enabled && !!query) { open(); }
  }, [enabled]);

  if (!enabled) { return null; }

  return (
    <div className="courseware-search-toggle">
      <Button
        variant="outline-primary"
        size="sm"
        className="p-1 mt-2 mr-2"
        aria-label={intl.formatMessage(messages.searchOpenAction)}
        onClick={open}
        data-testid="courseware-search-open-button"
        iconAfter={ManageSearch}
      >
        {intl.formatMessage(messages.contentSearchButton)}
      </Button>
    </div>
  );
};

export default CoursewareSearchToggle;
