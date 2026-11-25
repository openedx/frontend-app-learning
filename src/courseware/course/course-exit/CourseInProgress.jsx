import React, { useEffect } from 'react';

import {
  getAuthenticatedUser, getLinkProps, getSiteConfig, useIntl,
} from '@openedx/frontend-base';
import { Helmet } from 'react-helmet';
import { Alert, Button } from '@openedx/paragon';

import { useCourseHomeMeta } from '../../../course-home/data/apiHooks';
import { useDatesTabUrl } from '../../../course-tabs/hooks';

import CatalogSuggestion from './CatalogSuggestion';
import DashboardFootnote from './DashboardFootnote';
import messages from './messages';
import { logClick, logVisit } from './utils';
import { useCourseId } from '@src/generic/course-params';

const CourseInProgress = () => {
  const intl = useIntl();
  const courseId = useCourseId();
  const {
    org,
    title,
  } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};
  const { administrator } = getAuthenticatedUser();

  // Get dates tab link for 'view course schedule' button
  const datesTabLink = useDatesTabUrl();

  useEffect(() => logVisit(org, courseId, administrator, 'in_progress'), [org, courseId, administrator]);

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            pageName: intl.formatMessage(messages.endOfCourseTitle),
            courseTitle: title,
            siteName: getSiteConfig().siteName,
          })}
        </title>
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
                {...getLinkProps(datesTabLink)}
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
};

export default CourseInProgress;
