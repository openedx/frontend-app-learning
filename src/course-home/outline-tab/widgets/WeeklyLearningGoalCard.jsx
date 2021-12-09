import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Form, Card, Icon } from '@edx/paragon';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Email } from '@edx/paragon/icons';
import { useSelector } from 'react-redux';
import messages from '../messages';
import LearningGoalButton from './LearningGoalButton';
import { saveWeeklyLearningGoal } from '../../data';
import { useModel } from '../../../generic/model-store';
import './FlagButton.scss';

function WeeklyLearningGoalCard({
  daysPerWeek,
  subscribedToReminders,
  intl,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    isMasquerading,
    org,
  } = useModel('courseHomeMeta', courseId);

  const { administrator } = getAuthenticatedUser();

  const [daysPerWeekGoal, setDaysPerWeekGoal] = useState(daysPerWeek);
  // eslint-disable-next-line react/prop-types
  const [isGetReminderSelected, setGetReminderSelected] = useState(subscribedToReminders);

  function handleSelect(days) {
    // Set the subscription button if this is the first time selecting a goal
    const selectReminders = daysPerWeekGoal === null ? true : isGetReminderSelected;
    setGetReminderSelected(selectReminders);
    setDaysPerWeekGoal(days);
    if (!isMasquerading) { // don't save goal updates while masquerading
      saveWeeklyLearningGoal(courseId, days, selectReminders);
      sendTrackEvent('edx.ui.lms.goal.days-per-week.changed', {
        org_key: org,
        courserun_key: courseId,
        is_staff: administrator,
        num_days: days,
        reminder_selected: selectReminders,
      });
    }
  }

  function handleSubscribeToReminders(event) {
    const isGetReminderChecked = event.target.checked;
    setGetReminderSelected(isGetReminderChecked);
    if (!isMasquerading) { // don't save goal updates while masquerading
      saveWeeklyLearningGoal(courseId, daysPerWeekGoal, isGetReminderChecked);
      sendTrackEvent('edx.ui.lms.goal.reminder-selected.changed', {
        org_key: org,
        courserun_key: courseId,
        is_staff: administrator,
        num_days: daysPerWeekGoal,
        reminder_selected: isGetReminderChecked,
      });
    }
  }

  return (
    <Card
      className="row w-100 m-0 mb-3 shadow-sm border-0"
      data-testid="weekly-learning-goal-card"
    >
      <Card.Body className="p-3 p-lg-3.5">
        <h2 className="h4 mb-1 text-primary-500">{intl.formatMessage(messages.setWeeklyGoal)}</h2>
        <Card.Text
          className="text-gray-700 small mb-2.5"
        >
          {intl.formatMessage(messages.setWeeklyGoalDetail)}
        </Card.Text>
        <div
          className="flag-button-container m-0 p-0"
        >
          <LearningGoalButton
            level="casual"
            isSelected={daysPerWeekGoal === 1}
            handleSelect={handleSelect}
          />
          <LearningGoalButton
            level="regular"
            isSelected={daysPerWeekGoal === 3}
            handleSelect={handleSelect}
          />
          <LearningGoalButton
            level="intense"
            isSelected={daysPerWeekGoal === 5}
            handleSelect={handleSelect}
          />
        </div>
        <div className="d-flex pt-3">
          <Form.Switch
            checked={isGetReminderSelected}
            onChange={(event) => handleSubscribeToReminders(event)}
            disabled={!daysPerWeekGoal}
          >
            <small>{intl.formatMessage(messages.setGoalReminder)}</small>
          </Form.Switch>
        </div>
      </Card.Body>
      {isGetReminderSelected && (
        <Card.Footer className="border-0 px-2.5 bg-light-200">
          <div className="row w-100 m-0 small align-center">
            <div className="d-flex align-items-center pr-1">
              <Icon
                className="text-primary-500"
                src={Email}
              />
            </div>
            <div className="col">
              {intl.formatMessage(messages.goalReminderDetail)}
            </div>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
}

WeeklyLearningGoalCard.propTypes = {
  daysPerWeek: PropTypes.number,
  subscribedToReminders: PropTypes.bool,
  intl: intlShape.isRequired,
};

WeeklyLearningGoalCard.defaultProps = {
  daysPerWeek: null,
  subscribedToReminders: false,
};
export default injectIntl(WeeklyLearningGoalCard);
