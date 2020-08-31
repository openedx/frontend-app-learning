import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Card, Input } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

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
  const [editingGoal, setEditingGoal] = useState(false);

  function selectGoalHandler(event) {
    const key = event.currentTarget.value;
    const { options } = event.currentTarget;
    const { text } = options[options.selectedIndex];
    const newGoal = {
      key,
      text,
    };

    setEditingGoal(false);
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
      <section className="mb-3">
        <div className="row w-100 m-0">
          <div className="col-12 p-0">
            <label className="h6" htmlFor="edit-goal-selector">
              {intl.formatMessage(messages.goal)}
            </label>
          </div>
          <div className="col-12 p-0">
            <Card>
              <Card.Body className="px-3 py-2">
                <div className="row w-100 m-0 justify-content-between align-items-center">
                  <div className="col-10 p-0">
                    {!editingGoal && (
                      <p className="m-0">{selectedGoal.text}</p>
                    )}
                    {editingGoal && (
                      <Input
                        id="edit-goal-selector"
                        type="select"
                        defaultValue={selectedGoal.key}
                        onBlur={() => { setEditingGoal(false); }}
                        onChange={(event) => { selectGoalHandler(event); }}
                        options={goalOptions.map(([goalKey, goalText]) => (
                          { value: goalKey, label: goalText }
                        ))}
                        autoFocus
                      />
                    )}
                  </div>
                  <Button
                    aria-label={intl.formatMessage(messages.editGoal)}
                    className="p-1"
                    size="sm"
                    variant="light"
                    onClick={() => { setEditingGoal(true); }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
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
