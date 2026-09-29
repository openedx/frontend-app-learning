import { useCoursewareMetadata, useMinimalCourseOutline, useSequenceMetadata } from '../../courseware/data/apiHooks';
import { ALERT_TYPES, useAlert } from '../../generic/user-messages';

import messages from './messages';

function useSequenceBannerTextAlert(sequenceId) {
  const sequenceQuery = useSequenceMetadata(sequenceId, { enabled: false });
  const sequence = sequenceQuery.data?.sequence;
  const hasBannerText = sequenceQuery.isSuccess && !!sequence.bannerText;

  // Show Alert that comes along with the sequence
  const bannerTextAlert = hasBannerText ? {
    code: null,
    dismissible: false,
    text: sequence.bannerText,
    type: ALERT_TYPES.INFO,
    topic: 'sequence',
  } : {};
  useAlert(hasBannerText, bannerTextAlert);
}

function useSequenceEntranceExamAlert(courseId, sequenceId, intl) {
  const coursewareMetadata = useCoursewareMetadata(courseId, { enabled: false }).data;
  const outlineSequence = useMinimalCourseOutline(courseId, { enabled: false }).data?.sequences[sequenceId];
  const sequenceQuery = useSequenceMetadata(sequenceId, { enabled: false });
  const {
    entranceExamCurrentScore,
    entranceExamEnabled,
    entranceExamId,
    entranceExamMinimumScorePct,
    entranceExamPassed,
  } = coursewareMetadata?.entranceExamData || {};
  const entranceExamAlertVisible = sequenceQuery.isSuccess && entranceExamEnabled
    && entranceExamId === outlineSequence?.sectionId;
  let entranceExamText;

  if (entranceExamPassed) {
    entranceExamText = intl.formatMessage(
      messages.entranceExamTextPassed,
      { entranceExamCurrentScore: entranceExamCurrentScore * 100 },
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
