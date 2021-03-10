import React, { Suspense } from 'react';

import { ModalLayer } from '@edx/paragon';

import PageLoading from '../../generic/PageLoading';

const BlockModalContent = React.lazy(() => import('./BlockModalContent'));

export const BlockModal = () => (
  <ModalLayer
    isOpen
    onClose={() => {}}
    isBlocking
  >
    <Suspense fallback={(<PageLoading srMessage="Loading blocked content modal" />)}>
      <BlockModalContent />
    </Suspense>
  </ModalLayer>
);

export default BlockModal;
