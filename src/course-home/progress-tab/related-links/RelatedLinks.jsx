import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import { useContextId } from '../../../data/hooks';

import messages from './messages';
import { useModel } from '../../../generic/model-store';

const RelatedLinks = () => {
  const intl = useIntl();
  const courseId = useContextId();
  const {
    org,
    tabs,
  } = useModel('courseHomeMeta', courseId);

  const { administrator } = getAuthenticatedUser();
  const logLinkClicked = (linkName) => {
    sendTrackEvent('edx.ui.lms.course_progress.related_links.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      link_clicked: linkName,
    });
  };

  const overviewTab = tabs.find(tab => tab.slug === 'outline');
  const overviewTabUrl = overviewTab && overviewTab.url;
  const datesTab = tabs.find(tab => tab.slug === 'dates');
  const datesTabUrl = datesTab && datesTab.url;

  return (
    <section className="mb-4 x-small">
      <h3 className="h4">{intl.formatMessage(messages.relatedLinks)}</h3>
      <ul className="pl-4">
        {datesTabUrl && (
        <li>
          <Hyperlink destination={datesTabUrl} onClick={() => logLinkClicked('dates')}>
            {intl.formatMessage(messages.datesCardLink)}
          </Hyperlink>
          <p>{intl.formatMessage(messages.datesCardDescription)}</p>
        </li>
        )}
        {overviewTabUrl && (
        <li>
          <Hyperlink destination={overviewTabUrl} onClick={() => logLinkClicked('course_outline')}>
            {intl.formatMessage(messages.outlineCardLink)}
          </Hyperlink>
          <p>{intl.formatMessage(messages.outlineCardDescription)}</p>
        </li>
        )}
      </ul>
    </section>
  );
};

export default RelatedLinks;
