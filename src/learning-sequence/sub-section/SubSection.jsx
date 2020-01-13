import React, { useContext, Suspense } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import SubSectionNavigation from './SubSectionNavigation';
import CourseStructureContext from '../CourseStructureContext';
import Unit from './Unit';
import {
  useLoadSubSectionMetadata,
  useExamRedirect,
  usePersistentUnitPosition,
  useMissingUnitRedirect,
} from './data/hooks';
import SubSectionMetadataContext from './SubSectionMetadataContext';
import PageLoading from '../PageLoading';
import messages from './messages';
import { useCurrentUnit } from '../data/hooks';

const ContentLock = React.lazy(() => import('./content-lock'));

function SubSection({ intl }) {
  const {
    courseId,
    subSectionId,
    unitId,
    blocks,
  } = useContext(CourseStructureContext);
  const { metadata, loaded } = useLoadSubSectionMetadata(courseId, subSectionId);
  usePersistentUnitPosition(courseId, subSectionId, unitId, metadata);

  useExamRedirect(metadata, blocks);

  useMissingUnitRedirect(metadata, loaded);
  const unit = useCurrentUnit();

  const ready = blocks !== null && metadata !== null && unitId && unit;

  if (!ready) {
    return null;
  }

  const isGated = metadata.gatedContent.gated;

  return (
    <SubSectionMetadataContext.Provider value={metadata}>
      <section className="d-flex flex-column flex-grow-1">
        <SubSectionNavigation />
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
    </SubSectionMetadataContext.Provider>
  );
}

SubSection.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SubSection);
