import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { useModel } from '@src/generic/model-store';
import PageLoading from '@src/generic/PageLoading';

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
        <Suspense fallback={<PageLoading srMessage={formatMessage(messages.loadingLockedContent)} />}>
          <PluginSlot
            id="fbe_message_plugin"
          >
            <LockPaywall courseId={courseId} />
          </PluginSlot>
        </Suspense>
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
