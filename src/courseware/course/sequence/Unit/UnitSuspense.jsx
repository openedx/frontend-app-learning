import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useModel } from '../../../../generic/model-store';
import PageLoading from '../../../../generic/PageLoading';

import messages from '../messages';
import HonorCode from '../honor-code';
import LockPaywall from '../lock-paywall';
import * as hooks from './hooks';
import { modelKeys } from './constants';

const UnitSuspense = ({
  courseId,
  id,
}) => {
  const { formatMessage } = useIntl();
  const shouldDisplayHonorCode = hooks.useShouldDisplayHonorCode({ courseId, id });
  const unit = useModel(modelKeys.units, id);
  const meta = useModel(modelKeys.coursewareMeta, courseId);
  const shouldDisplayContentGating = (
    meta.contentTypeGatingEnabled && unit.containsContentTypeGatedContent
  );

  const suspenseComponent = (message, Component) => (
    <Suspense fallback={<PageLoading srMessage={formatMessage(message)} />}>
      <Component courseId={courseId} />
    </Suspense>
  );

  return (
    <>
      {shouldDisplayContentGating && (
        suspenseComponent(messages.loadingLockedContent, LockPaywall)
      )}
      {shouldDisplayHonorCode && (
        suspenseComponent(messages.loadingHonorCode, HonorCode)
      )}
    </>
  );
};

UnitSuspense.propTypes = {
  courseId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default UnitSuspense;
