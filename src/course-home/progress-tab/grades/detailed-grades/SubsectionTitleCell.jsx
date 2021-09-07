import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Row } from '@edx/paragon';
import { ArrowDropDown, ArrowDropUp, Blocked } from '@edx/paragon/icons';

import messages from '../messages';
import { useModel } from '../../../../generic/model-store';
import ProblemScoreDrawer from './ProblemScoreDrawer';

function SubsectionTitleCell({ intl, subsection }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    org,
  } = useModel('courseHomeMeta', courseId);
  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const {
    blockKey,
    displayName,
    problemScores,
    url,
  } = subsection;

  const { administrator } = getAuthenticatedUser();
  const logSubsectionClicked = () => {
    sendTrackEvent('edx.ui.lms.course_progress.detailed_grades_assignment.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      assignment_block_key: blockKey,
    });
  };

  return (
    <Collapsible.Advanced>
      <Row className="w-100 m-0">
        <Collapsible.Trigger
          className="mr-1 position-absolute"
          aria-label={intl.formatMessage(messages.problemScoreToggleAltText, { subsectionTitle: displayName })}
          tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
        >
          <Collapsible.Visible whenClosed><Icon src={ArrowDropDown} /></Collapsible.Visible>
          <Collapsible.Visible whenOpen><Icon src={ArrowDropUp} /></Collapsible.Visible>
        </Collapsible.Trigger>
        <span className="small d-inline ml-4 pl-1">
          {gradesFeatureIsFullyLocked || subsection.learnerHasAccess ? ''
            : (
              <Icon
                id={`detailedGradesBlockedIcon${subsection.blockKey}`}
                aria-label={intl.formatMessage(messages.noAccessToSubsection, { displayName })}
                className="mr-1 mt-1 d-inline-flex"
                style={{ height: '1rem', width: '1rem' }}
                src={Blocked}
                data-testid="blocked-icon"
              />
            )}
          {url ? (
            <a
              href={url}
              className="muted-link small"
              onClick={logSubsectionClicked}
              tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
              aria-labelledby={`detailedGradesBlockedIcon${subsection.blockKey}`}
            >
              {displayName}
            </a>
          ) : (
            <span className="greyed-out small">{displayName}</span>
          )}
        </span>
      </Row>
      <Collapsible.Body className="d-flex w-100">
        <ProblemScoreDrawer problemScores={problemScores} subsection={subsection} />
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
}

SubsectionTitleCell.propTypes = {
  intl: intlShape.isRequired,
  subsection: PropTypes.shape.isRequired,
};

export default injectIntl(SubsectionTitleCell);
