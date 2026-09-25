import React, { Suspense } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useUnit } from '@src/courseware/data/apiHooks';
import { useModel } from '@src/generic/model-store';
import PageLoading from '@src/generic/PageLoading';
import { GatedUnitContentMessageSlot } from '../../../../plugin-slots/GatedUnitContentMessageSlot';

import messages from '../messages';
import HonorCode from '../honor-code';
import * as hooks from './hooks';
import { modelKeys } from './constants';

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
  const meta = useModel(modelKeys.coursewareMeta, courseId);
  const shouldDisplayContentGating = (
    meta.contentTypeGatingEnabled && unit?.containsContentTypeGatedContent
  );

  return (
    <>
      {shouldDisplayContentGating && (
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingLockedContent)} />}>
          <GatedUnitContentMessageSlot courseId={courseId} />
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
