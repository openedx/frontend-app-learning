import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import { Search } from '@edx/paragon/icons';
import messages from './messages';
import { fetchCoursewareSearchSettings } from '../data/thunks';

const CoursewareSearch = ({ intl, ...rest }) => {
  const { courseId } = useParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetchCoursewareSearchSettings(courseId).then(response => setEnabled(response.enabled));
  }, [courseId]);

  if (!enabled) { return null; }

  return (
    <Button variant="tertiary" size="sm" className="p-1 mt-2 mr-2 rounded-lg" aria-label={intl.formatMessage(messages.searchOpenAction)} data-testid="courseware-search-button" {...rest}>
      <Icon src={Search} />
    </Button>
  );
};

CoursewareSearch.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearch);
