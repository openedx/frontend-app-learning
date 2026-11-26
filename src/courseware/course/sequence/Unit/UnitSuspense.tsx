import React, { Suspense } from 'react';

import { useIntl } from '@openedx/frontend-base';

import { useCoursewareMetadata, useUnit } from '@src/courseware/data/apiHooks';
import PageLoading from '@src/generic/PageLoading';
import GatedUnitContentMessageSlot from '@src/slots/GatedUnitContentMessageSlot';

import messages from '../messages';
import HonorCode from '../honor-code';
import * as hooks from './hooks';

interface Props {
  courseId: string;
  sequenceId: string;
  id: string;
}

const UnitSuspense = ({
  courseId,
  sequenceId,
  id,
}: Props) => {
  const { formatMessage } = useIntl();
  const shouldDisplayHonorCode = hooks.useShouldDisplayHonorCode({ courseId, sequenceId, id });
  const unit = useUnit(sequenceId, id).data;
  const coursewareMetadata = useCoursewareMetadata(courseId, { enabled: false }).data;
  const shouldDisplayContentGating = (
    coursewareMetadata?.contentTypeGatingEnabled && unit?.containsContentTypeGatedContent
  );

  return (
    <>
      {shouldDisplayContentGating && (
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingLockedContent)} />}>
          <GatedUnitContentMessageSlot courseId={courseId} sequenceId={sequenceId} unitId={id} />
        </Suspense>
      )}
      {shouldDisplayHonorCode && (
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingHonorCode)} />}>
          <HonorCode courseId={courseId} />
        </Suspense>
      )}
    </>
  );
};

export default UnitSuspense;
