import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import CompletionDonutChart from './CompletionDonutChart';
import messages from './messages';

function CourseCompletion({ intl }) {
  return (
    <section className="text-dark-700 mb-4 rounded raised-card p-4">
      <div className="row w-100 m-0">
        <div className="col-12 col-sm-6 col-md-7 p-0">
          <h2>{intl.formatMessage(messages.courseCompletion)}</h2>
          <p className="small">
            {intl.formatMessage(messages.completionBody)}
          </p>
        </div>
        <div className="col-12 col-sm-6 col-md-5 mt-sm-n3 p-0 text-center">
          <CompletionDonutChart />
        </div>
      </div>
    </section>
  );
}

CourseCompletion.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCompletion);
