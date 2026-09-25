import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useUnit } from '@src/courseware/data/apiHooks';
import { usePluginsCallback } from '@src/generic/plugin-overrides';

import messages from '../messages';
import ContentIFrame from './ContentIFrame';
import UnitSuspense from './UnitSuspense';
import { views } from './constants';
import { useExamAccess, useShouldDisplayHonorCode } from './hooks';
import { getIFrameUrl } from './urls';
import UnitTitleSlot from '../../../../plugin-slots/UnitTitleSlot';

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
  const { pathname } = useLocation();
  const { authenticatedUser } = React.useContext(AppContext);
  const examAccess = useExamAccess({ id });
  const shouldDisplayHonorCode = useShouldDisplayHonorCode({ courseId, sequenceId, id });
  const unit = useUnit(sequenceId, id).data;
  const view = authenticatedUser ? views.student : views.public;
  const shouldDisplayUnitPreview = pathname.startsWith('/preview') && isOriginalUserStaff;

  const getUrl = usePluginsCallback('getIFrameUrl', () => getIFrameUrl({
    id,
    view,
    format,
    examAccess,
    jumpToId: searchParams.get('jumpToId') ?? undefined,
    preview: shouldDisplayUnitPreview,
  }));

  const iframeUrl = getUrl();

  if (!unit) {
    return null;
  }

  return (
    <div className="unit">
      <UnitTitleSlot unitId={id} {...{ unit, renderUnitNavigation }} />
      <UnitSuspense {...{ courseId, sequenceId, id }} />
      <ContentIFrame
        elementId="unit-iframe"
        id={id}
        iframeUrl={iframeUrl}
        loadingMessage={formatMessage(messages.loadingSequence)}
        onLoaded={onLoaded}
        shouldShowContent={!shouldDisplayHonorCode && !examAccess.blockAccess}
        title={unit.title}
        courseId={courseId}
      />
    </div>
  );
};

export default Unit;
