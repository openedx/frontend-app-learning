import React from 'react';

import {
  injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Alert, Button } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { useModel } from '../../../generic/model-store';

import DashboardFootnote from './DashboardFootnote';
import messages from './messages';

function CourseNonPassing({ intl }) {
  const { courseId } = useParams();
  const { tabs } = useModel('courses', courseId);

  // Get progress tab link for 'view grades' button
  const progressTab = tabs.find(tab => tab.slug === 'progress');
  const progressLink = progressTab && progressTab.url;

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.endOfCourseTitle)} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="row w-100 mx-0 mb-4 px-5 py-4 border border-light justify-content-center">
        <div className="col-12 p-0 h2 text-center">
          { intl.formatMessage(messages.endOfCourseHeader) }
        </div>
        <Alert variant="primary" className="col col-lg-10 mt-4 d-flex align-items-start">
          <div className="flex-grow-1 mr-5">{ intl.formatMessage(messages.endOfCourseDescription) }</div>
          {progressLink && (
            <Button variant="primary" className="flex-shrink-0" href={progressLink}>
              {intl.formatMessage(messages.viewGradesButton)}
            </Button>
          )}
        </Alert>
        <DashboardFootnote />
      </div>
    </>
  );
}

CourseNonPassing.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseNonPassing);
