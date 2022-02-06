import React from 'react';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Blocked } from '@edx/paragon/icons';
import { Icon, Hyperlink } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import DetailedGradesTable from './DetailedGradesTable';

import messages from '../messages';

function DetailedGrades({ intl }) {
  const { administrator } = getAuthenticatedUser();
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    org,
  } = useModel('courseHomeMeta', courseId);
  const {
    gradesFeatureIsFullyLocked,
    gradesFeatureIsPartiallyLocked,
    sectionScores,
  } = useModel('progress', courseId);

  const hasSectionScores = sectionScores.length > 0;

  const logOutlineLinkClick = () => {
    sendTrackEvent('edx.ui.lms.course_progress.detailed_grades.course_outline_link.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
    });
  };

  const outlineLink = (
    <Hyperlink
      variant="muted"
      isInline
      destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/course`}
      onClick={logOutlineLinkClick}
      tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
    >
      {intl.formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  return (
    <section className="text-dark-700">
      <h3 className="h4 mb-3">{intl.formatMessage(messages.detailedGrades)}</h3>
      {gradesFeatureIsPartiallyLocked && (
        <div className="mb-3 small ml-0 d-inline">
          <Icon className="mr-1 mt-1 d-inline-flex" style={{ height: '1rem', width: '1rem' }} src={Blocked} data-testid="blocked-icon" />
          {intl.formatMessage(messages.gradeSummaryLimitedAccessExplanation)}
        </div>
      )}
      {hasSectionScores && (
        <DetailedGradesTable />
      )}
      {!hasSectionScores && (
        <p className="small">{intl.formatMessage(messages.detailedGradesEmpty)}</p>
      )}
      <p className="x-small m-0">
        <FormattedMessage
          id="progress.ungradedAlert"
          defaultMessage="For progress on ungraded aspects of the course, view your {outlineLink}."
          description="Text that precede link that redirect to course outline page"
          values={{ outlineLink }}
        />
      </p>
    </section>
  );
}

DetailedGrades.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DetailedGrades);
