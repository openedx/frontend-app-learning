import React from 'react';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Redirect, useParams } from 'react-router-dom';
import { Button, Hyperlink } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { LinkedinIcon, LinkedinShareButton } from 'react-share';
import SocialIcons from '../../courseware/course/celebration/SocialIcons';
import celebration from './assets/celebration_456x328.gif';
import certificate from './assets/certificate.png';
import messages from './messages';
import socialMessages from '../../courseware/course/celebration/messages';
import { useModel } from '../../generic/model-store';

function CourseCompletion({ intl }) {
  const { courseId: courseIdFromUrl } = useParams();
  const {
    courseCompletionIsActive,
    userHasPassingGrade,
    certificateData,
  } = useModel('courses', courseIdFromUrl);

  const { downloadUrl } = certificateData;

  if (!courseCompletionIsActive || !userHasPassingGrade) {
    return <Redirect to={`/course/${courseIdFromUrl}`} />;
  }

  const { username } = getAuthenticatedUser();

  const dashboardLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/dashboard`}
    >
      <FormattedMessage
        id="courseCelebration.dashboardLink"
        defaultMessage="dashboard"
        description="Dashboard link text"
      />
    </Hyperlink>
  );
  const profileLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/u/${username}`}
    >
      <FormattedMessage
        id="courseCelebration.profileLink"
        defaultMessage="profile"
        description="Profile link text"
      />
    </Hyperlink>
  );

  const handleDownload = () => {
    global.location.replace(downloadUrl);
  };

  return (
    <div className="d-flex flex-column border border-light p-3 mb-3 mt-5">
      <h2 className="align-self-center">{ intl.formatMessage(messages.congratulationsHeader) }</h2>
      <div className="align-self-center mb-3 h4 font-weight-normal">{ intl.formatMessage(messages.shareHeader) }</div>
      <div className="align-self-center mb-3"><SocialIcons courseId={courseIdFromUrl} /></div>
      <div className="align-self-center mb-5"><img src={celebration} alt="" className="img-fluid" /></div>
      { !downloadUrl && (
        <div className="align-self-center d-flex flex-row p-4 mb-3 bg-primary-100">
          <div className="d-flex flex-column justify-content-between">
            <div className="h4 mb-0">{intl.formatMessage(messages.certificateHeader)}</div>
            <FormattedMessage
              id="courseCelebration.certificateBody"
              defaultMessage="Showcase your accomplishment on LinkedIn or your resumé today. You can download your
                certificate now and access it any time from your {dashboardLink} and {profileLink}."
              description="Body in certificate banner"
              values={{
                dashboardLink,
                profileLink,
              }}
            />
            <div>
              <LinkedinShareButton
                className="mr-2"
                style={{
                  backgroundColor: '#007fb1',
                  borderRadius: '20px',
                  padding: '4px 10px 4px 4px',
                  color: 'white',
                }}
              >
                <LinkedinIcon round size={32} bgStyle={{ fill: 'white' }} iconFillColor="#007fb1" />
                <span style={{ margin: '7px 5px 0 5px', fontWeight: '500' }}>{intl.formatMessage(messages.linkedinButton)}</span>
                <span className="sr-only">{intl.formatMessage(socialMessages.shareService, { service: 'LinkedIn' })}</span>
              </LinkedinShareButton>
              <Button variant="outline-primary" onClick={() => handleDownload()} style={{ backgroundColor: '#FFFFFF' }}>
                {intl.formatMessage(messages.downloadButton)}
              </Button>
            </div>
          </div>
          <div className="col-3"><img src={certificate} alt="" className="img-fluid" /></div>
        </div>
      )}
      <div className="align-self-center mb-3 text-gray-500">
        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" style={{ width: '20px' }} />
        <FormattedMessage
          id="courseCelebration.dashboardInfo"
          defaultMessage="You can always access this course and its materials on your {dashboardLink}."
          description="Text letting the user know they can view their dashboard"
          values={{
            dashboardLink,
          }}
        />
      </div>
    </div>
  );
}

CourseCompletion.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCompletion);
