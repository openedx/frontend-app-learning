import React from 'react';
import classNames from 'classnames';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Locked } from '@openedx/paragon/icons';
import {
  Icon, Hyperlink, breakpoints, useWindowSize,
} from '@openedx/paragon';
import { useContextId } from '../../../../data/hooks';
import { useModel } from '../../../../generic/model-store';
import { showUngradedAssignments } from '../../utils';

import DetailedGradesTable from './DetailedGradesTable';

import messages from '../messages';

const DetailedGrades = () => {
  const intl = useIntl();
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
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

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
          {intl.formatMessage(messages.practiceScoreInfoText)}
        </li>
        <li>
          <b>{intl.formatMessage(messages.gradedScoreLabel)} </b>
          {intl.formatMessage(messages.gradedScoreInfoText)}
        </li>
      </ul>
      {gradesFeatureIsPartiallyLocked && (
        <div className="mb-3 small ml-0 d-inline">
          <Icon className="mr-1 mt-1 d-inline-flex" style={{ height: '1rem', width: '1rem' }} src={Locked} data-testid="locked-icon" />
          {intl.formatMessage(messages.gradeSummaryLimitedAccessExplanation, { upgradeLink: '' })}
        </div>
      )}
      {hasSectionScores && (
        <DetailedGradesTable />
      )}
      {!hasSectionScores && (
        <p className={classNames({ small: !wideScreen })}>
          {intl.formatMessage(emptyTableMsg)}
        </p>
      )}
      {overviewTabUrl && !showUngradedAssignments() && (
        <p className={classNames('m-0', { small: !wideScreen })}>
          {intl.formatMessage(messages.ungradedAlert, { outlineLink })}
        </p>
      )}
    </section>
  );
};

export default DetailedGrades;
