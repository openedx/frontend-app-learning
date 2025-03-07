import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getLocale, isRtl, useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const ProblemScoreDrawer = ({ problemScores, subsection }) => {
  const intl = useIntl();
  const isLocaleRtl = isRtl(getLocale());

  const scoreLabel = subsection.hasGradedAssignment ? messages.gradedScoreLabel : messages.practiceScoreLabel;

  return (
    <span className="row w-100 m-0 x-small ml-4 pt-2 pl-1 text-gray-700 flex-nowrap">
      <span id="problem-score-label" className="col-auto p-0">{intl.formatMessage(scoreLabel)}</span>
      <div className={classNames('col', 'p-0', { 'greyed-out': !subsection.learnerHasAccess })}>
        <ul className="list-unstyled row w-100 m-0" aria-labelledby="problem-score-label">
          {problemScores.map((problemScore, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={i} className="ml-3">{problemScore.earned}{isLocaleRtl ? '\\' : '/'}{problemScore.possible}</li>
          ))}
        </ul>
      </div>
    </span>
  );
};

ProblemScoreDrawer.propTypes = {
  problemScores: PropTypes.arrayOf(PropTypes.shape({
    earned: PropTypes.number.isRequired,
    possible: PropTypes.number.isRequired,
  })).isRequired,
  subsection: PropTypes.shape({
    learnerHasAccess: PropTypes.bool,
    hasGradedAssignment: PropTypes.bool,
  }).isRequired,
};

export default ProblemScoreDrawer;
