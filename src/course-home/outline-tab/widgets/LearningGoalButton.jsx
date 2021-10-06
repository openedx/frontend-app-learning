import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ReactComponent as FlagIntenseIcon } from '@edx/paragon/icons/svg/flag.svg';
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
      className="col-auto col-md-12 col-xl-auto m-0 p-0 pb-md-3 pb-xl-0 shadow-none"
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
        className="position-absolute invisible"
      />
      <FlagButton
        buttonIcon={values.icon}
        title={intl.formatMessage(values.title)}
        text={intl.formatMessage(values.text)}
        handleSelect={() => { handleSelect(values.daysPerWeek); }}
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
