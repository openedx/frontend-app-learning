import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import messages from '../../../courseware/course/course-exit/messages';
import { logClick } from '../../../courseware/course/course-exit/utils';
import { useModel } from '../../../generic/model-store';
import { useContextId } from '../../../data/hooks';

interface LinkProps {
  variant: string;
  destination: string;
}

const DashboardFootnoteLink: React.FC<LinkProps> = ({ variant, destination }: LinkProps) => {
  const intl = useIntl();
  const courseId = useContextId();
  const { org } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();
  return (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={destination}
      className="text-reset"
      onClick={() => logClick(org, courseId, administrator, 'dashboard_footnote', { variant })}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );
};

interface PluginProps {
  variant: string
}

export const DashboardFootnoteLinkPluginSlot: React.FC = ({ variant }: PluginProps) => {
  const destination = `${getConfig().LMS_BASE_URL}/dashboard`;
  return (
    <PluginSlot
      id="org.openedx.frontend.learning.course_exit_dashboard_footnote_link.v1"
      slotOptions={{
        mergeProps: true,
      }}
    >
      <DashboardFootnoteLink variant={variant} destination={destination} />
    </PluginSlot>
  );
};
