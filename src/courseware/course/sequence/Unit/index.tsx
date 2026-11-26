import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuthenticatedUser, useIntl } from '@openedx/frontend-base';

import { useIsPreview, useUnit } from '@src/courseware/data/apiHooks';
import UnitContentSlot from '@src/slots/UnitContentSlot';
import UnitTitleSlot from '@src/slots/UnitTitleSlot';

import messages from '../messages';
import ContentIFrame from './ContentIFrame';
import UnitSuspense from './UnitSuspense';
import { unitIFrameId, views } from './constants';
import { useExamAccess, useMasqueradeKey, useShouldDisplayHonorCode } from './hooks';
import { getIFrameUrl } from './urls';

interface Props {
  courseId: string;
  format?: string | null;
  onLoaded?: () => void;
  id: string;
  sequenceId: string;
  isOriginalUserStaff: boolean;
  renderUnitNavigation: (isAtTop: boolean) => React.ReactNode;
}

const Unit = ({
  courseId,
  format = null,
  onLoaded,
  id,
  sequenceId,
  isOriginalUserStaff,
  renderUnitNavigation,
}: Props) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const isPreview = useIsPreview();
  const authenticatedUser = useAuthenticatedUser();
  const { blockAccess, accessToken } = useExamAccess();
  const shouldDisplayHonorCode = useShouldDisplayHonorCode({ courseId, sequenceId, id });
  const masqueradeKey = useMasqueradeKey(courseId, isOriginalUserStaff);
  const unit = useUnit(sequenceId, id).data;
  const view = authenticatedUser ? views.student : views.public;
  const preview = isPreview && isOriginalUserStaff;
  const jumpToId = searchParams.get('jumpToId') ?? undefined;
  const title = unit?.title ?? '';
  const loadingMessage = formatMessage(messages.loadingSequence);
  const shouldShowContent = !shouldDisplayHonorCode && !blockAccess;

  // One object, so that what builds the default URL can be handed on as it is. This and the content props are
  // memoized, along with the default content: the slot is, and the iframe keys its effects on the URL. The exam access object is rebuilt from its
  // fields, so that its identity does not depend on the hook's.
  const iframeUrlParams = useMemo(() => ({
    id,
    view,
    format,
    examAccess: { blockAccess, accessToken },
    jumpToId,
    preview,
  }), [id, view, format, blockAccess, accessToken, jumpToId, preview]);
  const contentProps = useMemo(() => ({
    elementId: unitIFrameId,
    id,
    iframeUrl: getIFrameUrl(iframeUrlParams),
    loadingMessage,
    onLoaded,
    shouldShowContent,
    title,
    courseId,
  }), [id, iframeUrlParams, loadingMessage, onLoaded, shouldShowContent, title, courseId]);
  const defaultContent = useMemo(() => <ContentIFrame {...contentProps} />, [contentProps]);

  if (!unit) {
    return null;
  }

  return (
    <div className="unit">
      <UnitTitleSlot
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={id}
        unit={unit}
        renderUnitNavigation={renderUnitNavigation}
      />
      <UnitSuspense {...{ courseId, sequenceId, id }} />
      {/* Keyed, so that a change of masquerade shows the unit as the LMS now renders it, whatever the slot holds. */}
      <UnitContentSlot
        key={masqueradeKey}
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={id}
        title={contentProps.title}
        elementId={contentProps.elementId}
        iframeUrl={contentProps.iframeUrl}
        iframeUrlParams={iframeUrlParams}
        loadingMessage={contentProps.loadingMessage}
        shouldShowContent={contentProps.shouldShowContent}
        onLoaded={contentProps.onLoaded}
      >
        {defaultContent}
      </UnitContentSlot>
    </div>
  );
};

export default Unit;
