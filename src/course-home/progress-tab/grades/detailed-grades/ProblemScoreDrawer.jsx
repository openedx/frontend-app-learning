import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';

function ProblemScoreDrawer({ intl, problemScores }) {
  return (
    <span className="row w-100 m-0 x-small ml-4 pt-2 pl-1 text-gray-700">
      <span id="problem-score-label">{intl.formatMessage(messages.problemScoreLabel)}</span>
      <ul className="list-unstyled row m-0" aria-labelledby="problem-score-label">
        {problemScores.map(problemScore => (
          <li className="ml-3.5">{problemScore.earned}/{problemScore.possible}</li>
        ))}
      </ul>
    </span>
  );
}

ProblemScoreDrawer.propTypes = {
  intl: intlShape.isRequired,
  problemScores: PropTypes.arrayOf(PropTypes.shape({
    earned: PropTypes.number.isRequired,
    possible: PropTypes.number.isRequired,
  })).isRequired,
};

export default injectIntl(ProblemScoreDrawer);
