import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import { useParams } from 'react-router-dom';

import { useCourseOutlineUrl, useDatesTabUrl } from '../../../course-tabs/hooks';
import messages from './messages';
import { useCourseHomeMeta } from '../../data/apiHooks';

const RelatedLinks = () => {
  const intl = useIntl();
  const { courseId } = useParams();
  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;

  const { administrator } = getAuthenticatedUser();
  const logLinkClicked = (linkName) => {
    sendTrackEvent('edx.ui.lms.course_progress.related_links.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      link_clicked: linkName,
    });
  };

  const courseOutlineUrl = useCourseOutlineUrl();
  const datesTabUrl = useDatesTabUrl();

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
        {courseOutlineUrl && (
        <li>
          <Hyperlink destination={courseOutlineUrl} onClick={() => logLinkClicked('course_outline')}>
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
