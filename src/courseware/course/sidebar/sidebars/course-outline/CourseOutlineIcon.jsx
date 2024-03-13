import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from './messages';
import { OutlineIcon } from './icons';

const CourseOutlineIcon = ({
  intl,
  status,
}) => (
  <>
    <span className="pgn__icon m-0 m-auto" aria-label={intl.formatMessage(messages.openCourseOutlineTrigger)}>
      <OutlineIcon />
    </span>
    {status === 'active'
      ? (
        <span
          className="rounded-circle p-1 position-absolute"
          data-testid="course-outline-dot"
          style={{
            top: '0.3rem',
            right: '0.55rem',
          }}
        />
      )
      : null}
  </>
);

CourseOutlineIcon.propTypes = {
  intl: intlShape.isRequired,
  status: PropTypes.string.isRequired,
};

export default injectIntl(CourseOutlineIcon);
