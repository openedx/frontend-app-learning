import { useSelector } from 'react-redux';

import { useModel } from '../../generic/model-store';
import { ALERT_TYPES, useAlert } from '../../generic/user-messages';

import messages from './messages';

function useSequenceBannerTextAlert(sequenceId) {
  const sequence = useModel('sequences', sequenceId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  // Show Alert that comes along with the sequence
  useAlert(sequenceStatus === 'loaded' && sequence.bannerText, {
    code: null,
    dismissible: false,
    text: sequence.bannerText,
    type: ALERT_TYPES.INFO,
    topic: 'sequence',
  });
}

function useSequenceEntranceExamAlert(courseId, sequenceId, intl) {
  const course = useModel('coursewareMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  const {
    entranceExamCurrentScore,
    entranceExamEnabled,
    entranceExamId,
    entranceExamMinimumScorePct,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const entranceExamAlertVisible = sequenceStatus === 'loaded' && entranceExamEnabled && entranceExamId === sequence.sectionId;
  let entranceExamText;

  if (entranceExamPassed) {
    entranceExamText = intl.formatMessage(
      messages.entranceExamTextPassed, { entranceExamCurrentScore: entranceExamCurrentScore * 100 },
    );
  } else {
    entranceExamText = intl.formatMessage(messages.entranceExamTextNotPassing, {
      entranceExamCurrentScore: entranceExamCurrentScore * 100,
      entranceExamMinimumScorePct: entranceExamMinimumScorePct * 100,
    });
  }

  useAlert(entranceExamAlertVisible, {
    code: null,
    dismissible: false,
    text: entranceExamText,
    type: ALERT_TYPES.INFO,
    topic: 'sequence',
  });
}

export { useSequenceBannerTextAlert, useSequenceEntranceExamAlert };
