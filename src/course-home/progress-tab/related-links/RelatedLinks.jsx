import React from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import messages from './messages';

function RelatedLinks({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  return (
    <section className="mb-4 x-small">
      <h3 className="h4">{intl.formatMessage(messages.relatedLinks)}</h3>
      <ul className="pl-4">
        <li>
          <Hyperlink destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/dates`}>
            {intl.formatMessage(messages.datesCardLink)}
          </Hyperlink>
          <p>{intl.formatMessage(messages.datesCardDescription)}</p>
        </li>
        <li>
          <Hyperlink destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/course`}>
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
