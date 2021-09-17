import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Form, Card, Icon } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Email } from '@edx/paragon/icons';
import { ReactComponent as FlagIntenseIcon } from '@edx/paragon/icons/svg/flag.svg';
import { ReactComponent as FlagCasualIcon } from './flag_outline.svg';
import { ReactComponent as FlagRegularIcon } from './flag_gray.svg';
import messages from '../messages';
import FlagButton from './FlagButton';

import { saveWeeklyCourseGoal } from '../../data';

function WeeklyLearningGoal({
  selectedGoal,
  courseId,
  intl,
}) {
  // eslint-disable-next-line react/prop-types
  const [daysPerWeekGoal, setDaysPerWeekGoal] = useState('daysPerWeek' in selectedGoal ? selectedGoal.daysPerWeek : 0);
  // eslint-disable-next-line react/prop-types
  const [isGetReminderChecked, setGetReminderChecked] = useState('subscribedToReminders' in selectedGoal ? selectedGoal.subscribedToReminders : false);
  const LevelToDays = {
    CASUAL: 3,
    REGULAR: 4,
    INTENSE: 5,
  };
  Object.freeze(LevelToDays);

  function handleSelect(days) {
    setDaysPerWeekGoal(days);
    saveWeeklyCourseGoal(courseId, days, isGetReminderChecked).then((response) => {
      const { data } = response;
      const {
        header,
        message,
      } = data;
      // TODO: add Toast?, remove console.log
      console.log(header, ':', message);
    });
  }

  function handleSubscribeToReminders(event) {
    const isGetReminders = event.target.checked;
    setGetReminderChecked(isGetReminders);
    saveWeeklyCourseGoal(courseId, daysPerWeekGoal, isGetReminders).then((response) => {
      const { data } = response;
      const {
        header,
        message,
      } = data;
      // TODO: add Toast?, remove console.log
      console.log(header, ':', message);
    });
  }
  const buttonRowStyle = 'row w-100 m-0 p-0 justify-content-around'; // 'row w-100 m-0 flex-grow-1 p-0 justify content-end';
  const flagButtonStyle = 'col-auto col-md-12 col-xl-auto m-0 p-0 pb-md-3 pb-xl-0'; // 'col-auto flex-grow-1 p-0';

  return (
    <div className="row w-100 m-0 p-0">
      <Card className="mb-3" data-testid="course-goal-card">
        <Card.Body>
          <Card.Title>
            <div className="h4 m-0">{intl.formatMessage(messages.setWeeklyGoal)}</div>
          </Card.Title>
          <Card.Text>
            {intl.formatMessage(messages.setWeeklyGoalDetail)}
          </Card.Text>
          <div className={buttonRowStyle}>
            <div className={flagButtonStyle}>
              <FlagButton
                icon={<FlagCasualIcon />}
                title={intl.formatMessage(messages.goalButtonTitleCasual)}
                text={intl.formatMessage(messages.goalButtonTextCasual)}
                isEnabled={daysPerWeekGoal === LevelToDays.CASUAL}
                handleSelect={() => { handleSelect(LevelToDays.CASUAL); }}
              />
            </div>
            <div className={flagButtonStyle}>
              <FlagButton
                icon={<FlagRegularIcon />}
                title={intl.formatMessage(messages.goalButtonTitleRegular)}
                text={intl.formatMessage(messages.goalButtonTextRegular)}
                isEnabled={daysPerWeekGoal === LevelToDays.REGULAR}
                handleSelect={() => { handleSelect(LevelToDays.REGULAR); }}
              />
            </div>
            <div className={flagButtonStyle}>
              <FlagButton
                icon={<FlagIntenseIcon />}
                title={intl.formatMessage(messages.goalButtonTitleIntense)}
                text={intl.formatMessage(messages.goalButtonTextIntense)}
                isEnabled={daysPerWeekGoal === LevelToDays.INTENSE}
                handleSelect={() => { handleSelect(LevelToDays.INTENSE); }}
              />
            </div>
          </div>
          <div className="row p-3">
            <Form.Switch
              checked={isGetReminderChecked}
              onChange={(event) => handleSubscribeToReminders(event)}
            >
              {intl.formatMessage(messages.setGoalReminder)}
            </Form.Switch>
          </div>
        </Card.Body>
        {/* This is supposed to fill with gray in the bottom of the card */}
        {isGetReminderChecked && (
          <Card.Footer className="border-0 px-2.5">
            <div className="row w-100  m-0  small align-center">
              <div className="d-flex align-items-center pr-1.5">
                <Icon src={Email} />
              </div>
              <div className="col align-center">
                {intl.formatMessage(messages.goalReminderDetail)}
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

    </div>
  );
}

WeeklyLearningGoal.propTypes = {
  selectedGoal: PropTypes.shape({}).isRequired,
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(WeeklyLearningGoal);
