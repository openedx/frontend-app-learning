import React from 'react';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

const CourseHandouts = () => {
  const intl = useIntl();
  const {
    courseId,
  } = useSelector(state => state.courseHome);
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
};

export default CourseHandouts;
