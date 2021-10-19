import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ReactComponent as FlagIntenseIcon } from '@edx/paragon/icons/svg/flag.svg';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import { ReactComponent as FlagCasualIcon } from './flag_outline.svg';
import { ReactComponent as FlagRegularIcon } from './flag_gray.svg';
import FlagButton from './FlagButton';
import messages from '../messages';

function LearningGoalButton({
  level,
  currentGoal,
  handleSelect,
  intl,
}) {
  /* This is not the standard XL media query */
  const isPastXl = useMediaQuery({ query: '(min-width: 1225px)' });

  const buttonDetails = {
    casual: {
      daysPerWeek: 1,
      title: messages.casualGoalButtonTitle,
      text: messages.casualGoalButtonText,
      icon: <FlagCasualIcon />,
    },
    regular: {
      daysPerWeek: 3,
      title: messages.regularGoalButtonTitle,
      text: messages.regularGoalButtonText,
      icon: <FlagRegularIcon />,
    },
    intense: {
      daysPerWeek: 5,
      title: messages.intenseGoalButtonTitle,
      text: messages.intenseGoalButtonText,
      icon: <FlagIntenseIcon />,
    },
  };

  const values = buttonDetails[level];

  return (
    <label
      htmlFor={`weekly-learning-goal-input-${level}`}
      className={classNames('col-auto col-md-12  m-0 p-0 pb-md-3 pb-xl-0 shadow-none',
        `${isPastXl ? 'col-xl-auto' : ''}`)}
      // This is required to make the component visible to tabbing
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex="0"
    >
      <input
        type="radio"
        data-testid={`weekly-learning-goal-input-${level}`}
        id={`weekly-learning-goal-input-${level}`}
        name="learningGoal"
        radioGroup="learningGoal"
        value={values.daysPerWeek}
        onChange={() => handleSelect(values.daysPerWeek)}
        tabIndex="0"
        checked={values.daysPerWeek === currentGoal}
        className="position-absolute"
        style={{ opacity: 0 }}
      />
      <FlagButton
        buttonIcon={values.icon}
        title={intl.formatMessage(values.title)}
        text={intl.formatMessage(values.text)}
      />
    </label>
  );
}

LearningGoalButton.propTypes = {
  level: PropTypes.string.isRequired,
  currentGoal: PropTypes.number.isRequired,
  handleSelect: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(LearningGoalButton);
