import React from 'react';
import { useParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useOutlineTabData } from '../../data/apiHooks';

const CourseHandouts = () => {
  const intl = useIntl();
  const { courseId } = useParams();
  const {
    handoutsHtml,
  } = useOutlineTabData(courseId, { enabled: false }).data ?? {};

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
