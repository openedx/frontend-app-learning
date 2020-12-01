import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown } from '@edx/paragon';

import messages from '../messages';
import { saveCourseGoal } from '../../data';

function UpdateGoalSelector({
  courseId,
  goalOptions,
  intl,
  selectedGoal,
  setGoalToDisplay,
  setGoalToastHeader,
}) {
  function selectGoalHandler(event) {
    const key = event.currentTarget.id;
    const text = event.currentTarget.innerText;
    const newGoal = {
      key,
      text,
    };

    setGoalToDisplay(newGoal);
    saveCourseGoal(courseId, key).then((response) => {
      const { data } = response;
      const {
        header,
      } = data;

      setGoalToastHeader(header);
    });
  }

  return (
    <>
      <section className="mb-4">
        <div className="row w-100 m-0">
          <div className="col-12 p-0">
            <label className="h6 m-0" htmlFor="edit-goal-selector">
              {intl.formatMessage(messages.goal)}
            </label>
          </div>
          <div className="col-12 p-0">
            <Dropdown className="py-2">
              <Dropdown.Toggle variant="outline-primary" block id="edit-goal-selector" data-testid="edit-goal-selector">
                {selectedGoal.text}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {goalOptions.map(([goalKey, goalText]) => (
                  <Dropdown.Item
                    id={goalKey}
                    key={goalKey}
                    onClick={(event) => { selectGoalHandler(event); }}
                    role="button"
                  >
                    {goalText}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </section>
    </>
  );
}

UpdateGoalSelector.propTypes = {
  courseId: PropTypes.string.isRequired,
  goalOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string),
  ).isRequired,
  intl: intlShape.isRequired,
  selectedGoal: PropTypes.shape({
    key: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
  setGoalToDisplay: PropTypes.func.isRequired,
  setGoalToastHeader: PropTypes.func.isRequired,
};

export default injectIntl(UpdateGoalSelector);
