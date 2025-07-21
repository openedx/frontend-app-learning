import React, { Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import PageLoading from '../../../generic/PageLoading';
import { useModel } from '../../../generic/model-store';

import messages from './messages';
import Unit from './Unit';

const ContentLock = React.lazy(() => import('./content-lock'));

const SequenceContent = ({
  gated,
  courseId,
  sequenceId,
  unitId,
  unitLoadedHandler,
  isOriginalUserStaff,
  renderUnitNavigation,
}) => {
  const intl = useIntl();
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
            srMessage={intl.formatMessage(messages.loadingLockedContent)}
          />
        )}
      >
        <ContentLock
          courseId={courseId}
          sequenceTitle={sequence.title}
          prereqSectionName={sequence.gatedContent.prereqSectionName}
          prereqId={sequence.gatedContent.prereqId}
        />
      </Suspense>
    );
  }

  const unit = useModel('units', unitId);
  if (!unitId || !unit) {
    return (
      <div>
        {intl.formatMessage(messages.noContent)}
      </div>
    );
  }

  return (
    <Unit
      courseId={courseId}
      format={sequence.format}
      key={unitId}
      id={unitId}
      onLoaded={unitLoadedHandler}
      isOriginalUserStaff={isOriginalUserStaff}
      renderUnitNavigation={renderUnitNavigation}
    />
  );
};

SequenceContent.propTypes = {
  gated: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  unitLoadedHandler: PropTypes.func.isRequired,
  isOriginalUserStaff: PropTypes.bool.isRequired,
  renderUnitNavigation: PropTypes.func.isRequired,
};

SequenceContent.defaultProps = {
  unitId: null,
};

export default SequenceContent;
