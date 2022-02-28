import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Button, Hyperlink } from '@edx/paragon';
import certImage from '../../../generic/assets/edX_certificate.png';
import messages from './messages';

/**
 * Note for Open edX developers:
 * There are pieces of this component that are hard-coded and specific to edX that may not apply to your organization.
 * This includes mentions of our edX program types (MicroMasters, MicroBachelors, Professional Certificate, and
 * XSeries), along with their respective support article URLs and image variable names.
 *
 * Currently, this component will not render unless the learner's completed course has a related program of one of the
 * four aforementioned types. This will not impact the parent components (i.e. CourseCelebration will render normally).
 */

const programTypes = ['microbachelors', 'micromasters', 'professional-certificate', 'xseries'];

function ProgramCompletion({
  intl,
  progress,
  title,
  type,
  url,
}) {
  if (!programTypes.includes(type) || progress.notStarted !== 0 || progress.inProgress !== 0) {
    return null;
  }

  const programLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={url}
      className="text-reset"
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );

  return (
    <Alert variant="primary" className="my-3" data-testid="program-completion">
      <div className="d-flex">
        <div className="col order-1 order-md-0 pl-0 pr-0 pr-md-5">
          <div className="h4">{intl.formatMessage(messages.programsLastCourseHeader, { title })}</div>
          <p>
            <FormattedMessage
              id="courseExit.programCompletion.dashboardMessage"
              defaultMessage="To view your certificate status, check the Programs section of your {programLink}."
              values={{ programLink }}
              description="Text that precedes link to program page"
            />
          </p>
          {type === 'microbachelors' && (
            <>
              <p>
                <Hyperlink
                  style={{ textDecoration: 'underline' }}
                  destination={`${getConfig().SUPPORT_URL}/hc/en-us/articles/360004623154`}
                  className="text-reset"
                >
                  {intl.formatMessage(messages.microBachelorsLearnMore)}
                </Hyperlink>
              </p>
              <Button variant="primary" className="mb-2 mb-sm-0" href={`${getConfig().CREDENTIALS_BASE_URL}/records`}>
                {intl.formatMessage(messages.applyForCredit)}
              </Button>
            </>
          )}
          {type === 'micromasters' && (
            <p>
              {intl.formatMessage(messages.microMastersMessage)}
              {' '}
              <Hyperlink
                style={{ textDecoration: 'underline' }}
                destination={`${getConfig().SUPPORT_URL}/hc/en-us/articles/360010346853-Does-a-Micromasters-certificate-count-towards-the-online-Master-s-degree-`}
                className="text-reset"
              >
                {intl.formatMessage(messages.microMastersLearnMore)}
              </Hyperlink>
            </p>
          )}
        </div>
        <div className="col-12 order-0 col-md-3 order-md-1 w-100 mb-3 p-0 text-center">
          <img
            src={certImage}
            alt={`${intl.formatMessage(messages.certificateImage)}`}
            className="w-100"
            style={{ maxWidth: '13rem' }}
            data-testid={type}
          />
        </div>
      </div>
    </Alert>
  );
}

ProgramCompletion.propTypes = {
  intl: intlShape.isRequired,
  progress: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    inProgress: PropTypes.number.isRequired,
    notStarted: PropTypes.number.isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default injectIntl(ProgramCompletion);
