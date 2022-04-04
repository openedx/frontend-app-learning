import React, { useEffect } from 'react';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import {
  Alert, breakpoints, Button, useWindowSize,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { CheckCircle } from '@edx/paragon/icons';
import { useModel } from '../../../generic/model-store';

import CelebrationMobile from './assets/celebration_456x328.gif';
import CelebrationDesktop from './assets/celebration_750x540.gif';
import certificate from '../../../generic/assets/edX_certificate.png';
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
    isSelfPaced,
    canViewCertificate,
  } = useModel('courseHomeMeta', courseId);
  const { end, certificateData } = useModel('coursewareMeta', courseId);
  const { administrator } = getAuthenticatedUser();
  let certificateAvailableDate = certificateData?.certificateAvailableDate || end;
  certificateAvailableDate = intl.formatDate(certificateAvailableDate, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const courseEndDate = intl.formatDate(end, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;
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
        {!canViewCertificate && !isSelfPaced && (
        <>
          {!wideScreen && (
            <div className="col-12 mt-3 mb-4 px-0 px-md-5 text-center">
              <img
                src={CelebrationMobile}
                alt={`${intl.formatMessage(messages.congratulationsImage)}`}
                className="img-fluid"
              />
            </div>
          )}
          {wideScreen && (
            <div className="col-12 mt-3 mb-4 px-0 px-md-5 text-center">
              <img
                src={CelebrationDesktop}
                alt={`${intl.formatMessage(messages.congratulationsImage)}`}
                className="img-fluid"
                style={{ width: '36rem' }}
              />
            </div>
          )}
        </>
        )}
        { // We don't want to show a learner an nonPassing message
          // before the certificates are viewable for the course.
          canViewCertificate || isSelfPaced
            ? (
              <Alert variant="primary" className="col col-lg-10 mt-4">
                <div className="row w-100 m-0 align-items-start">
                  <div className="flex-grow-1 col-sm p-0">
                    {intl.formatMessage(messages.endOfCourseDescription)}
                  </div>
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
            ) : (
              <div className="col-12 px-0 px-md-5">
                <Alert Alert variant="success" icon={CheckCircle}>
                  <div className="row w-100 m-0">
                    <div className="col order-1 order-md-0 pl-0 pr-0 pr-md-5">
                      <h4 className="h4">{intl.formatMessage(messages.courseFinishedEarlyHeading)}</h4>
                      <p>
                        {intl.formatMessage(
                          messages.courseFinishedEarlyBody,
                          {
                            courseEndDate,
                            certificateAvailableDate,
                          },
                        )}
                      </p>
                    </div>
                    <div className="col-12 order-0 col-md-3 order-md-1 w-100 mb-3 p-0 text-center">
                      <img
                        src={certificate}
                        alt={`${intl.formatMessage(messages.certificateImage)}`}
                        className="w-100"
                        style={{ maxWidth: '13rem' }}
                      />
                    </div>
                  </div>
                </Alert>
              </div>
            )
        }
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
