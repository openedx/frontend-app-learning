import React from 'react';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import messages from './messages';
import { useModel } from '../../../generic/model-store';

function RelatedLinks({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    org,
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

  return (
    <section className="mb-4 x-small">
      <h3 className="h4">{intl.formatMessage(messages.relatedLinks)}</h3>
      <ul className="pl-4">
        <li>
          <Hyperlink destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/dates`} onClick={() => logLinkClicked('dates')}>
            {intl.formatMessage(messages.datesCardLink)}
          </Hyperlink>
          <p>{intl.formatMessage(messages.datesCardDescription)}</p>
        </li>
        <li>
          <Hyperlink destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/course`} onClick={() => logLinkClicked('course_outline')}>
            {intl.formatMessage(messages.outlineCardLink)}
          </Hyperlink>
          <p>{intl.formatMessage(messages.outlineCardDescription)}</p>
        </li>
      </ul>
    </section>
  );
}

RelatedLinks.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RelatedLinks);
