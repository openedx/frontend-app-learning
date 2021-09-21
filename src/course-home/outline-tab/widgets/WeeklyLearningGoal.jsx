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
  daysPerWeek,
  subscribedToReminders,
  courseId,
  intl,
}) {
  const [daysPerWeekGoal, setDaysPerWeekGoal] = useState(daysPerWeek);
  // eslint-disable-next-line react/prop-types
  const [isGetReminderSelected, setGetReminderSelected] = useState(subscribedToReminders);
  const LevelToDays = {
    CASUAL: 3,
    REGULAR: 4,
    INTENSE: 5,
  };
  Object.freeze(LevelToDays);

  function handleSelect(days) {
    setDaysPerWeekGoal(days);
    saveWeeklyCourseGoal(courseId, days, isGetReminderSelected);
  }

  function handleSubscribeToReminders(event) {
    const isGetReminderChecked = event.target.checked;
    setGetReminderSelected(isGetReminderChecked);
    saveWeeklyCourseGoal(courseId, daysPerWeekGoal, isGetReminderChecked);
  }

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
          <div className="row w-100 m-0 p-0 justify-content-around">
            <div className="col-auto col-md-12 col-xl-auto m-0 p-0 pb-md-3 pb-xl-0">
              <FlagButton
                icon={<FlagCasualIcon />}
                srText={intl.formatMessage(messages.setLearningGoalButtonScreenReaderText)}
                title={intl.formatMessage(messages.casualGoalButtonTitle)}
                text={intl.formatMessage(messages.casualGoalButtonText)}
                isEnabled={LevelToDays.CASUAL === daysPerWeekGoal}
                handleSelect={() => { handleSelect(LevelToDays.CASUAL); }}
              />
            </div>
            <div className="col-auto col-md-12 col-xl-auto m-0 p-0 pb-md-3 pb-xl-0">
              <FlagButton
                icon={<FlagRegularIcon />}
                srText={intl.formatMessage(messages.setLearningGoalButtonScreenReaderText)}
                title={intl.formatMessage(messages.regularGoalButtonTitle)}
                text={intl.formatMessage(messages.regularGoalButtonText)}
                isEnabled={LevelToDays.REGULAR === daysPerWeekGoal}
                handleSelect={() => { handleSelect(LevelToDays.REGULAR); }}
              />
            </div>
            <div className="col-auto col-md-12 col-xl-auto m-0 p-0 pb-md-3 pb-xl-0">
              <FlagButton
                icon={<FlagIntenseIcon />}
                srText={intl.formatMessage(messages.setLearningGoalButtonScreenReaderText)}
                title={intl.formatMessage(messages.intenseGoalButtonTitle)}
                text={intl.formatMessage(messages.intenseGoalButtonText)}
                isEnabled={LevelToDays.INTENSE === daysPerWeekGoal}
                handleSelect={() => { handleSelect(LevelToDays.INTENSE); }}
              />
            </div>
          </div>
          <div className="row p-3">
            <Form.Switch
              checked={isGetReminderSelected}
              onChange={(event) => handleSubscribeToReminders(event)}
              disabled={!daysPerWeekGoal}
            >
              {intl.formatMessage(messages.setGoalReminder)}
            </Form.Switch>
          </div>
        </Card.Body>
        {/* This is supposed to fill with gray in the bottom of the card */}
        {isGetReminderSelected && (
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
  daysPerWeek: PropTypes.number,
  subscribedToReminders: PropTypes.bool,
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

WeeklyLearningGoal.defaultProps = {
  daysPerWeek: null,
  subscribedToReminders: false,
};
export default injectIntl(WeeklyLearningGoal);
