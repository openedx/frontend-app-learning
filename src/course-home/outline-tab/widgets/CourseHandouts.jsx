import React from 'react';
import { useSelector } from 'react-redux';
import { useWindowSize, breakpoints } from '@openedx/paragon';
import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

const CourseHandouts = ({ intl }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    handoutsHtml,
  } = useModel('outline', courseId);
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

  if (!handoutsHtml) {
    return null;
  }

  return (
    <section className="mb-4">
      <h2 className="h4">{intl.formatMessage(messages.handouts)}</h2>
      <LmsHtmlFragment
        className={classNames({ small: !wideScreen })}
        html={handoutsHtml}
        title={intl.formatMessage(messages.handouts)}
      />
    </section>
  );
};

CourseHandouts.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseHandouts);
