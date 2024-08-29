import React from 'react';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { breakpoints, useWindowSize } from '@edx/paragon';

import CompletionDonutChart from './CompletionDonutChart';
import messages from './messages';

const CourseCompletion = ({ intl }) => {
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

  return (
    <section className={classNames('text-dark-700 mb-4 rounded raised-card p-4', { small: !wideScreen })}>
      <div className="row w-100 m-0">
        <div className="col-12 col-sm-6 col-md-7 p-0">
          <h2>{intl.formatMessage(messages.courseCompletion)}</h2>
          <p>
            {intl.formatMessage(messages.completionBody)}
          </p>
        </div>
        <div className="col-12 col-sm-6 col-md-5 mt-sm-n3 p-0 text-center">
          <CompletionDonutChart />
        </div>
      </div>
    </section>
  );
};

CourseCompletion.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCompletion);
