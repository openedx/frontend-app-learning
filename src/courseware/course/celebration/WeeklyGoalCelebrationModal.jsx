import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@openedx/frontend-base';
import {
  ActionRow, Button, Icon, StandardModal,
} from '@openedx/paragon';
import { Lightbulb } from '@openedx/paragon/icons';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import Target from './assets/target.svg';
import messages from './messages';
import { recordWeeklyGoalCelebration } from './utils';

const WeeklyGoalCelebrationModal = ({
  courseId, daysPerWeek, isOpen, onClose, ...rest
}) => {
  const intl = useIntl();
  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;

  useEffect(() => {
    if (isOpen) {
      recordWeeklyGoalCelebration(org, courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <StandardModal
      className="celebration-modal"
      footerNode={(
        <ActionRow isStacked className="pb-2">
          <Button onClick={onClose}>{intl.formatMessage(messages.keepItUp)}</Button>
        </ActionRow>
      )}
      hasCloseButton={false}
      isOpen={isOpen}
      onClose={onClose}
      title={intl.formatMessage(messages.goalMet)}
      {...rest}
    >
      <>
        <div className="text-center px-3">
          <FormattedMessage
            id="learning.celebration.goalCongrats"
            defaultMessage="Congratulations, you met your learning goal of {nTimes} a week."
            description="Greeting for learners for their weekly goal, it as well indicate their gaol, i.e. (1,3 or 5 time(s) a week)"
            values={{
              nTimes: (<strong>{daysPerWeek} {daysPerWeek === 1 ? 'time' : 'times'}</strong>),
            }}
          />
        </div>
        <div className="d-flex justify-content-center py-4.5">
          <img src={Target} alt="" />
        </div>
        <div className="py-3 pl-3 bg-light-300 small d-inline-flex">
          <Icon
            src={Lightbulb}
            className="mr-2"
            style={{ height: '21px', width: '22px' }}
          />
          <div>
            <FormattedMessage
              id="learning.celebration.setGoal"
              defaultMessage="Setting a goal can help you {strongText} in your course."
              description="It explain the advantages of setting goal"
              values={{
                strongText: (<strong>achieve higher performance</strong>),
              }}
            />
          </div>
        </div>
      </>
    </StandardModal>
  );
};

WeeklyGoalCelebrationModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  // Course passes the selected goal's, which a learner with no goal set has none of.
  daysPerWeek: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WeeklyGoalCelebrationModal;
