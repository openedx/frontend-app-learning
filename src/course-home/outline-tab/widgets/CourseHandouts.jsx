import React from 'react';

import { useIntl } from '@openedx/frontend-base';

import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useOutlineTabData } from '../../data/apiHooks';
import { useCourseId } from '@src/generic/course-params';

const CourseHandouts = () => {
  const intl = useIntl();
  const courseId = useCourseId();
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
