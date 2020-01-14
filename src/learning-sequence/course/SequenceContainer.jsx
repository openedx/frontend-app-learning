import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history } from '@edx/frontend-platform';

import { useLoadSequenceMetadata } from './hooks';
import messages from '../messages';
import PageLoading from '../PageLoading';
import Sequence from '../sequence/Sequence';

/*
elementId: "edx_introduction"
bannerText: null
displayName: "Demo Course Overview"
items: Array(1)
0:
path: "Introduction > Demo Course Overview > Introduction: Video and Sequences"
href: ""
type: "video"
content: ""
graded: false
pageTitle: "Introduction: Video and Sequences"
bookmarked: false
id: "block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc"
complete: null
__proto__: Object
length: 1
__proto__: Array(0)
savePosition: true
isTimeLimited: false
gatedContent: {gatedSectionName: "Demo Course Overview", prereqUrl: null, prereqSectionName: null, gated: false, prereqId: null}
excludeUnits: true
tag: "sequential"
position: 1
showCompletion: true
itemId: "block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction"
ajaxUrl: "/courses/course-v1:edX+DemoX+Demo_Course/xblock/block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction/handler/xmodule_handler"
nextUrl: null
prevUrl: null
*/

function SequenceContainer({
  courseUsageKey, courseId, sequenceId, unitId, models, intl, onNext, onPrevious,
}) {
  const { metadata, loaded, units } = useLoadSequenceMetadata(courseUsageKey, sequenceId);
  console.log(units);
  useEffect(() => {
    if (loaded && !unitId) {
      const position = metadata.position - 1;
      const nextUnitId = metadata.items[position].id;
      history.push(`/course/${courseUsageKey}/${sequenceId}/${nextUnitId}`);
    }
  }, [loaded, metadata, unitId]);

  useEffect(() => {
    if (metadata && models) {
      if (metadata.isTimeLimited) {
        global.location.href = models[sequenceId].lmsWebUrl;
      }
    }
  }, [metadata, models]);

  console.log(metadata);
  if (!loaded || !unitId || (metadata && metadata.isTimeLimited)) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  const {
    displayName,
    showCompletion,
    isTimeLimited,
    savePosition,
    bannerText,
    gatedContent,
  } = metadata;

  const prerequisite = {
    id: gatedContent.prereqId,
    name: gatedContent.gatedSectionName,
  };

  return (
    <Sequence
      id={sequenceId}
      courseUsageKey={courseUsageKey}
      courseId={courseId}
      unitIds={metadata.items.map(item => item.id)}
      units={units}
      displayName={displayName}
      activeUnitId={unitId}
      showCompletion={showCompletion}
      isTimeLimited={isTimeLimited}
      isGated={gatedContent.gated}
      savePosition={savePosition}
      bannerText={bannerText}
      onNext={onNext}
      onPrevious={onPrevious}
      onNavigateUnit={() => console.log('hah2')}
      prerequisite={prerequisite}
    />
  );
}

SequenceContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SequenceContainer);
