import React, { useEffect } from 'react';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { Alert, Button } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { useModel } from '../../../generic/model-store';

import CatalogSuggestion from './CatalogSuggestion';
import DashboardFootnote from './DashboardFootnote';
import messages from './messages';
import { logClick, logVisit } from './utils';

function CourseNonPassing({ intl }) {
  const { courseId } = useSelector(state => state.courseware);
  const {
    org,
    tabs,
    title,
  } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();

  // Get progress tab link for 'view grades' button
  const progressTab = tabs.find(tab => tab.slug === 'progress');
  const progressLink = progressTab && progressTab.url;

  useEffect(() => logVisit(org, courseId, administrator, 'nonpassing'), [org, courseId, administrator]);

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.endOfCourseTitle)} | ${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="row w-100 mx-0 mb-4 px-5 py-4 border border-light justify-content-center">
        <div className="col-12 p-0 h2 text-center">
          { intl.formatMessage(messages.endOfCourseHeader) }
        </div>
        <Alert variant="primary" className="col col-lg-10 mt-4">
          <div className="row w-100 m-0 align-items-start">
            <div className="flex-grow-1 col-sm p-0">{ intl.formatMessage(messages.endOfCourseDescription) }</div>
            {progressLink && (
              <Button
                variant="primary"
                className="flex-shrink-0 mt-3 mt-sm-0 mb-1 mb-sm-0 ml-sm-5"
                href={progressLink}
                onClick={() => logClick(org, courseId, administrator, 'view_grades')}
              >
                {intl.formatMessage(messages.viewGradesButton)}
              </Button>
            )}
          </div>
        </Alert>
        <DashboardFootnote variant="nonpassing" />
        <CatalogSuggestion variant="nonpassing" />
      </div>
    </>
  );
}

CourseNonPassing.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseNonPassing);
