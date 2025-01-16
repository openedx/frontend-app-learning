import React from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Blocked } from '@openedx/paragon/icons';
import { Icon, Hyperlink } from '@openedx/paragon';
import { useContextId } from '../../../../data/hooks';
import { useModel } from '../../../../generic/model-store';
import { showUngradedAssignments } from '../../utils';

import DetailedGradesTable from './DetailedGradesTable';

import messages from '../messages';

const DetailedGrades = ({ intl }) => {
  const { administrator } = getAuthenticatedUser();
  const courseId = useContextId();
  const {
    org,
    tabs,
  } = useModel('courseHomeMeta', courseId);
  const {
    gradesFeatureIsFullyLocked,
    gradesFeatureIsPartiallyLocked,
    sectionScores,
  } = useModel('progress', courseId);

  const hasSectionScores = sectionScores.length > 0;
  const emptyTableMsg = showUngradedAssignments()
    ? messages.detailedGradesEmpty : messages.detailedGradesEmptyOnlyGraded;

  const logOutlineLinkClick = () => {
    sendTrackEvent('edx.ui.lms.course_progress.detailed_grades.course_outline_link.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
    });
  };

  const overviewTab = tabs.find(tab => tab.slug === 'outline');
  const overviewTabUrl = overviewTab && overviewTab.url;

  const outlineLink = overviewTabUrl && (
    <Hyperlink
      variant="muted"
      isInline
      destination={overviewTabUrl}
      onClick={logOutlineLinkClick}
      tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
    >
      {intl.formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  return (
    <section className="text-dark-700">
      <h3 className="h4">{intl.formatMessage(messages.detailedGrades)}</h3>
      <ul className="micro mb-3 pl-3 text-gray-700">
        <li>
          <b>{intl.formatMessage(messages.practiceScoreLabel)} </b>
          <FormattedMessage
            id="progress.detailedGrades.practice-label.info.text"
            defaultMessage="Scores from non-graded activities meant for practice and self-assessment."
            description="Information text about non-graded practice score label"
          />
        </li>
        <li>
          <b>{intl.formatMessage(messages.gradedScoreLabel)} </b>
          <FormattedMessage
            id="progress.detailedGrades.problem-label.info.text"
            defaultMessage="Scores from activities that contribute to your final grade."
            description="Information text about graded problem score label"
          />
        </li>
      </ul>
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
        <p className="small">{intl.formatMessage(emptyTableMsg)}</p>
      )}
      {overviewTabUrl && !showUngradedAssignments() && (
        <p className="x-small m-0">
          <FormattedMessage
            id="progress.ungradedAlert"
            defaultMessage="For progress on ungraded aspects of the course, view your {outlineLink}."
            description="Text that precede link that redirect to course outline page"
            values={{ outlineLink }}
          />
        </p>
      )}
    </section>
  );
};

DetailedGrades.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DetailedGrades);
