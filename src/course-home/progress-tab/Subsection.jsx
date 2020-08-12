import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

import DueDateTime from './DueDateTime';
import ProblemScores from './ProblemScores';

function Subsection({
  intl,
  subsection,
}) {
  const scoreName = subsection.graded ? 'problem' : 'practice';

  const { earned, possible } = subsection.gradedTotal;

  const showTotalScore = ((possible > 0) || (earned > 0)) && subsection.showGrades;

  // screen reader information
  const totalScoreSr = intl.formatMessage(messages.pointsEarned, { earned, total: possible });

  return (
    <section className="my-3 ml-3">
      <div className="row">
        <a className="h6" href={subsection.url}>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: subsection.displayName }} />
          {showTotalScore && <span className="sr-only">{totalScoreSr}</span>}
        </a>
        {showTotalScore && <span className="small ml-1 mb-2">({earned}/{possible}) {subsection.percentGraded}%</span>}
      </div>
      <div className="row small">
        {subsection.format && <div className="mr-1">{subsection.format}</div>}
        {subsection.due !== null && <DueDateTime due={subsection.due} />}
      </div>
      {subsection.problemScores.length > 0 && subsection.showGrades && (
        <ProblemScores scoreName={scoreName} problemScores={subsection.problemScores} />
      )}
      {subsection.problemScores.length > 0 && !subsection.showGrades && subsection.showCorrectness === 'past_due' && (
        <div className="row small">{intl.formatMessage(messages[`${scoreName}HiddenUntil`])}</div>
      )}
      {subsection.problemScores.length > 0 && !subsection.showGrades && !(subsection.showCorrectness === 'past_due')
      && <div className="row small">{intl.formatMessage(messages[`${scoreName}Hidden`])}</div>}
      {(subsection.problemScores.length === 0) && (
        <div className="row small">{intl.formatMessage(messages.noScores)}</div>
      )}
    </section>
  );
}

Subsection.propTypes = {
  intl: intlShape.isRequired,
  subsection: PropTypes.shape({
    graded: PropTypes.bool.isRequired,
    url: PropTypes.string.isRequired,
    showGrades: PropTypes.bool.isRequired,
    gradedTotal: PropTypes.shape({
      possible: PropTypes.number,
      earned: PropTypes.number,
      graded: PropTypes.bool,
    }).isRequired,
    showCorrectness: PropTypes.string.isRequired,
    due: PropTypes.string,
    problemScores: PropTypes.arrayOf(PropTypes.shape({
      possible: PropTypes.number,
      earned: PropTypes.number,
      id: PropTypes.string,
    })).isRequired,
    format: PropTypes.string,
    // override: PropTypes.object,
    displayName: PropTypes.string.isRequired,
    percentGraded: PropTypes.number.isRequired,
  }).isRequired,
};

export default injectIntl(Subsection);
