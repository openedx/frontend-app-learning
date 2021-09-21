import React from 'react';
import PropTypes from 'prop-types';

import { Button, Card } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';

function StartOrResumeCourseCard({
  hasVisitedCourse,
  resumeCourseUrl,
  logResumeCourseClick,
  intl,
}) {
  return (
    <Card className="mb-3" data-testid="start-resume-panel">
      <Card.Body>
        <div className="row w-100 m-0 ">
          <h2 className="h4 col-auto flex-grow-1">{intl.formatMessage(messages.startBlurb)}</h2>
          <div className="col col-auto p-0 justify-content-end">
            <Button
              variant="brand"
              block
              href={resumeCourseUrl}
              onClick={() => logResumeCourseClick()}
            >
              {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

StartOrResumeCourseCard.propTypes = {
  hasVisitedCourse: PropTypes.bool.isRequired,
  resumeCourseUrl: PropTypes.string.isRequired,
  logResumeCourseClick: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
