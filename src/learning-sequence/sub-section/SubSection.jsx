import React, { useContext, Suspense } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import SequenceNavigation from './SequenceNavigation';
import CourseStructureContext from '../CourseStructureContext';
import Unit from './Unit';
import {
  useLoadSequenceMetadata,
  useExamRedirect,
  usePersistentUnitPosition,
  useMissingUnitRedirect,
} from './data/hooks';
import SequenceMetadataContext from './SequenceMetadataContext';
import PageLoading from '../PageLoading';
import messages from './messages';
import { useCurrentUnit } from '../data/hooks';

const ContentLock = React.lazy(() => import('./content-lock'));

function Sequence({ intl }) {
  const {
    courseUsageKey,
    sequenceId,
    unitId,
    blocks,
  } = useContext(CourseStructureContext);
  const { metadata, loaded } = useLoadSequenceMetadata(courseUsageKey, sequenceId);
  usePersistentUnitPosition(courseUsageKey, sequenceId, unitId, metadata);

  useExamRedirect(metadata, blocks);

  useMissingUnitRedirect(metadata, loaded);
  const unit = useCurrentUnit();

  const ready = blocks !== null && metadata !== null && unitId && unit;

  if (!ready) {
    return null;
  }

  const isGated = metadata.gatedContent.gated;

  return (
    <SequenceMetadataContext.Provider value={metadata}>
      <section className="d-flex flex-column flex-grow-1">
        <SequenceNavigation />
        {isGated && (
          <Suspense fallback={<PageLoading
            srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
          />}
          >
            <ContentLock />
          </Suspense>
        )}
        {!isGated && <Unit id={unitId} unit={unit} />}
      </section>
    </SequenceMetadataContext.Provider>
  );
}

Sequence.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Sequence);
