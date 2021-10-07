import React from 'react';
import PropTypes from 'prop-types';

import { Button, Card } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';

import { saveCourseGoal } from '../../data';

function CourseGoalCard({
  courseId,
  goalOptions,
  intl,
  title,
  setGoalToDisplay,
  setGoalToastHeader,
}) {
  function selectGoalHandler(event) {
    const selectedGoal = {
      key: event.currentTarget.getAttribute('data-goal-key'),
      text: event.currentTarget.getAttribute('data-goal-text'),
    };

    saveCourseGoal(courseId, selectedGoal.key).then((response) => {
      const { data } = response;
      const {
        header,
      } = data;

      setGoalToDisplay(selectedGoal);
      setGoalToastHeader(header);
    });
  }

  return (
    <Card className="mb-3" data-testid="course-goal-card">
      <Card.Body>
        <div className="row w-100 m-0 justify-content-between align-items-center">
          <div className="col col-8 p-0">
            <h2 className="h4 m-0">{intl.formatMessage(messages.welcomeTo)} {title}</h2>
          </div>
          <div className="col col-auto p-0">
            <Button
              variant="link"
              className="p-0"
              size="sm"
              block
              data-goal-key="unsure"
              data-goal-text={`${intl.formatMessage(messages.goalUnsure)}`}
              onClick={(event) => { selectGoalHandler(event); }}
            >
              {intl.formatMessage(messages.goalUnsure)}
            </Button>
          </div>
        </div>
        <Card.Text className="my-2 mx-1 text-dark-500">{intl.formatMessage(messages.setGoal)}</Card.Text>
        <div className="row w-100 m-0">
          {goalOptions.map((goal) => {
            const [goalKey, goalText] = goal;
            return (
              (goalKey !== 'unsure') && (
                <div key={`goal-${goalKey}`} className="col-auto flex-grow-1 mx-1 my-2 p-0">
                  <Button
                    variant="outline-primary"
                    block
                    data-goal-key={goalKey}
                    data-goal-text={goalText}
                    onClick={(event) => { selectGoalHandler(event); }}
                  >
                    {goalText}
                  </Button>
                </div>
              )
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}

CourseGoalCard.propTypes = {
  courseId: PropTypes.string.isRequired,
  goalOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string),
  ).isRequired,
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
  setGoalToDisplay: PropTypes.func.isRequired,
  setGoalToastHeader: PropTypes.func.isRequired,
};

export default injectIntl(CourseGoalCard);
