import PropTypes from 'prop-types';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useModel } from '@src/generic/model-store';
import { usePluginsCallback } from '@src/generic/plugin-store';

import BookmarkButton from '../../bookmark/BookmarkButton';
import messages from '../messages';
import ContentIFrame from './ContentIFrame';
import UnitSuspense from './UnitSuspense';
import { modelKeys, views } from './constants';
import { useExamAccess, useShouldDisplayHonorCode } from './hooks';
import { getIFrameUrl } from './urls';
import UnitTitleSlot from '../../../../plugin-slots/UnitTitleSlot';

const Unit = ({
  courseId,
  format,
  onLoaded,
  id,
}) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const { authenticatedUser } = React.useContext(AppContext);
  const examAccess = useExamAccess({ id });
  const shouldDisplayHonorCode = useShouldDisplayHonorCode({ courseId, id });
  const unit = useModel(modelKeys.units, id);
  const isProcessing = unit.bookmarkedUpdateState === 'loading';
  const view = authenticatedUser ? views.student : views.public;

  const getUrl = usePluginsCallback('getIFrameUrl', () => getIFrameUrl({
    id,
    view,
    format,
    examAccess,
    jumpToId: searchParams.get('jumpToId'),
  }));

  const iframeUrl = getUrl();

  return (
    <div className="unit">
      <div className="mb-0">
        <h3 className="h3">{unit.title}</h3>
        <UnitTitleSlot courseId={courseId} unitId={id} unitTitle={unit.title} />
      </div>
      <h2 className="sr-only">{formatMessage(messages.headerPlaceholder)}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={isProcessing}
      />
      <UnitSuspense {...{ courseId, id }} />
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

Unit.propTypes = {
  courseId: PropTypes.string.isRequired,
  format: PropTypes.string,
  id: PropTypes.string.isRequired,
  onLoaded: PropTypes.func,
};

Unit.defaultProps = {
  format: null,
  onLoaded: undefined,
};

export default Unit;
