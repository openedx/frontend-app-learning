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

function CourseInProgress({ intl }) {
  const { courseId } = useSelector(state => state.courseware);
  const {
    org,
    tabs,
    title,
  } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();

  // Get dates tab link for 'view course schedule' button
  const datesTab = tabs.find(tab => tab.slug === 'dates');
  const datesTabLink = datesTab && datesTab.url;

  useEffect(() => logVisit(org, courseId, administrator, 'in_progress'), [org, courseId, administrator]);

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.endOfCourseTitle)} | ${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="row w-100 mx-0 mb-4 px-5 py-4 border border-light justify-content-center">
        <div className="col-12 p-0 h2 text-center">
          { intl.formatMessage(messages.courseInProgressHeader) }
        </div>
        <Alert variant="primary" className="mt-4">
          <div className="row w-100 m-0 align-items-start">
            <div className="col-md p-0">{ intl.formatMessage(messages.courseInProgressDescription) }</div>
            {datesTabLink && (
              <Button
                variant="primary"
                className="mt-3 my-md-0 mb-1 ml-md-5 w-xs-100 w-md-auto"
                href={datesTabLink}
                onClick={() => logClick(org, courseId, administrator, 'view_dates_tab')}
              >
                {intl.formatMessage(messages.viewCourseScheduleButton)}
              </Button>
            )}
          </div>
        </Alert>
        <DashboardFootnote variant="in_progress" />
        <CatalogSuggestion variant="in_progress" />
      </div>
    </>
  );
}

CourseInProgress.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseInProgress);
