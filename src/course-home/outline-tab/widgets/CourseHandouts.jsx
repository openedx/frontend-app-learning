import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function CourseHandouts({ courseId, intl }) {
  const {
    handoutsHtml,
  } = useModel('outline', courseId);

  if (!handoutsHtml) {
    return null;
  }

  return (
    <section className="mb-4">
      <h2 className="h4">{intl.formatMessage(messages.handouts)}</h2>
      <LmsHtmlFragment
        className="small"
        html={handoutsHtml}
        title={intl.formatMessage(messages.handouts)}
      />
    </section>
  );
}

CourseHandouts.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(CourseHandouts);
