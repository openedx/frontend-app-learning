import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@openedx/frontend-base';
// These flag svgs are derivatives of the Flag icon from paragon
import flagIntenseIcon from './assets/flag_black.svg';
import flagCasualIcon from './assets/flag_outline.svg';
import flagRegularIcon from './assets/flag_gray.svg';
import FlagButton from './FlagButton';
import messages from '../messages';

const LearningGoalButton = ({
  level,
  isSelected,
  handleSelect,
}) => {
  const intl = useIntl();
  const buttonDetails = {
    casual: {
      daysPerWeek: 1,
      title: messages.casualGoalButtonTitle,
      text: messages.casualGoalButtonText,
      icon: <img src={flagCasualIcon} alt="" />,
    },
    regular: {
      daysPerWeek: 3,
      title: messages.regularGoalButtonTitle,
      text: messages.regularGoalButtonText,
      icon: <img src={flagRegularIcon} alt="" />,
    },
    intense: {
      daysPerWeek: 5,
      title: messages.intenseGoalButtonTitle,
      text: messages.intenseGoalButtonText,
      icon: <img src={flagIntenseIcon} alt="" />,
    },
  };

  const values = buttonDetails[level];

  return (
    <FlagButton
      buttonIcon={values.icon}
      title={intl.formatMessage(values.title)}
      text={intl.formatMessage(values.text)}
      handleSelect={() => handleSelect(values.daysPerWeek)}
      isSelected={isSelected}
    />
  );
};

LearningGoalButton.propTypes = {
  level: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  handleSelect: PropTypes.func.isRequired,
};

export default LearningGoalButton;
