import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, Row } from '@edx/paragon';
import { ArrowDropDown, ArrowDropUp } from '@edx/paragon/icons';

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
    gradesFeatureIsLocked,
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
          className="mr-1"
          aria-label={intl.formatMessage(messages.problemScoreToggleAltText, { subsectionTitle: displayName })}
          tabIndex={gradesFeatureIsLocked ? '-1' : '0'}
        >
          <Collapsible.Visible whenClosed><Icon src={ArrowDropDown} /></Collapsible.Visible>
          <Collapsible.Visible whenOpen><Icon src={ArrowDropUp} /></Collapsible.Visible>
        </Collapsible.Trigger>
        <a
          href={url}
          className="muted-link small"
          onClick={logSubsectionClicked}
          tabIndex={gradesFeatureIsLocked ? '-1' : '0'}
        >
          {displayName}
        </a>
      </Row>
      <Collapsible.Body>
        <ProblemScoreDrawer problemScores={problemScores} />
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
}

SubsectionTitleCell.propTypes = {
  intl: intlShape.isRequired,
  subsection: PropTypes.shape.isRequired,
};

export default injectIntl(SubsectionTitleCell);
