/**
 * Rooman AI Tutor — sidebar trigger button.
 *
 * Renders next to the existing Discussions / Notifications triggers in the
 * courseware top-right column. Clicking it tells SidebarContextProvider to
 * open the matching RoomanTutorSidebar panel.
 *
 * The ID below is what SIDEBARS keys off in `../index.js`. We hardcode the
 * string (not the WIDGETS enum from @src/constants) so we don't have to
 * patch an upstream file just to add the enum entry — that keeps rebases
 * clean. The upstream Discussions/Notifications triggers go through the
 * enum because they were always in upstream.
 */
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { ChatBubbleOutline } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import SidebarTriggerBase from '../../common/TriggerBase';
import messages from './messages';

export const ID = 'ROOMAN_TUTOR';

const RoomanTutorTrigger = ({ intl, onClick }) => (
  <SidebarTriggerBase
    onClick={onClick}
    ariaLabel={intl.formatMessage(messages.openTutorTrigger)}
  >
    <Icon src={ChatBubbleOutline} className="m-0 m-auto" />
  </SidebarTriggerBase>
);

RoomanTutorTrigger.propTypes = {
  intl: intlShape.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default injectIntl(RoomanTutorTrigger);
