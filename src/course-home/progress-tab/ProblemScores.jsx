import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

function ProblemScores({
  intl,
  scoreName,
  problemScores,
}) {
  return (
    <div className="row mt-1">
      <dl className="d-flex flex-wrap small text-gray-500">
        <dt className="mr-3">{intl.formatMessage(messages[`${scoreName}`])}</dt>
        {problemScores.map((problem, index) => {
          const key = scoreName + index;
          return (
            <dd className="mr-3" key={key}>{problem.earned}/{problem.possible}</dd>
          );
        })}
      </dl>
    </div>
  );
}

ProblemScores.propTypes = {
  intl: intlShape.isRequired,
  scoreName: PropTypes.string.isRequired,
  problemScores: PropTypes.arrayOf(PropTypes.shape({
    possible: PropTypes.number,
    earned: PropTypes.number,
    id: PropTypes.string,
  })).isRequired,
};

export default injectIntl(ProblemScores);
