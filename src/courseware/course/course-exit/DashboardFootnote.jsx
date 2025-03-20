import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

import { DashboardFootnoteLinkPluginSlot } from '../../../plugin-slots/CourseExitPluginSlots';
import Footnote from './Footnote';
import messages from './messages';

const DashboardFootnote = ({ variant }) => {
  const intl = useIntl();
  const dashboardLink = (<DashboardFootnoteLinkPluginSlot variant={variant} />);

  return (
    <Footnote
      icon={faCalendarAlt}
      text={intl.formatMessage(messages.dashboardInfo, { dashboardLink })}
    />
  );
};

DashboardFootnote.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default DashboardFootnote;
