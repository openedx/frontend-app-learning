import React, { Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PageLoading from '../../../PageLoading';
import { useModel } from '../../../model-store';

import messages from './messages';
import Unit from './Unit';

const ContentLock = React.lazy(() => import('./content-lock'));

function SequenceContent({
  gated, intl, courseId, sequenceId, unitId, unitLoadedHandler,
}) {
  const sequence = useModel('sequences', sequenceId);

  // Go back to the top of the page whenever the unit or sequence changes.
  useEffect(() => {
    global.scrollTo(0, 0);
  }, [sequenceId, unitId]);

  if (gated) {
    return (
      <Suspense
        fallback={(
          <PageLoading
            srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
          />
        )}
      >
        <ContentLock
          courseId={courseId}
          sequenceTitle={sequence.title}
          prereqSectionName={sequence.gatedContent.gatedSectionName}
          prereqId={sequence.gatedContent.prereqId}
        />
      </Suspense>
    );
  }

  if (unitId === null) {
    return (
      <div>
        {intl.formatMessage(messages['learn.sequence.no.content'])}
      </div>
    );
  }

  return (
    <Unit
      courseId={courseId}
      key={unitId}
      id={unitId}
      onLoaded={unitLoadedHandler}
    />
  );
}

SequenceContent.propTypes = {
  gated: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  unitLoadedHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

SequenceContent.defaultProps = {
  unitId: null,
};

export default injectIntl(SequenceContent);
