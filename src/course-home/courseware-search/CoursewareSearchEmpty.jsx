import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const CoursewareSearchEmpty = ({ intl }) => (
  <div className="courseware-search-results">
    <p className="courseware-search-results__empty" data-testid="no-results">{intl.formatMessage(messages.searchResultsNone)}</p>
  </div>
);

CoursewareSearchEmpty.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearchEmpty);
