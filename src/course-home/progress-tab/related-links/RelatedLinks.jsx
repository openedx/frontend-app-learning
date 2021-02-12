import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

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
          <Link to={`course/${courseId}/dates`}>{intl.formatMessage(messages.datesCardLink)}</Link>
          <p>{intl.formatMessage(messages.datesCardDescription)}</p>
        </li>
        <li>
          <Link to={`course/${courseId}/home`}>{intl.formatMessage(messages.outlineCardLink)}</Link>
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
