import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import { Search } from '@edx/paragon/icons';
import { useDispatch } from 'react-redux';
import { setShowSearch } from '../data/slice';
import messages from './messages';
import { useCoursewareSearchFeatureFlag } from './hooks';

const CoursewareSearchToggle = ({
  intl,
}) => {
  const dispatch = useDispatch();
  const enabled = useCoursewareSearchFeatureFlag();

  if (!enabled) { return null; }

  return (
    <div className="courseware-searc-toggle">
      <Button
        variant="tertiary"
        size="sm"
        className="p-1 mt-2 mr-2 rounded-lg"
        aria-label={intl.formatMessage(messages.searchOpenAction)}
        data-testid="courseware-search-button"
        onClick={() => dispatch(setShowSearch(true))}
      >
        <Icon src={Search} />
      </Button>
    </div>
  );
};

CoursewareSearchToggle.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearchToggle);
