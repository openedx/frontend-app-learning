import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import PageLoading from '../../../../generic/PageLoading';
import BookmarkButton from '../../bookmark/BookmarkButton';
import messages from '../messages';
import ContentIFrame from './ContentIFrame';
import hooks from './hooks';

const HonorCode = React.lazy(() => import('../honor-code'));
const LockPaywall = React.lazy(() => import('../lock-paywall'));

const Unit = ({
  courseId,
  format,
  onLoaded,
  id,
}) => {
  const { formatMessage } = useIntl();
  const {
    unit,
    contentTypeGatingEnabled,
    shouldDisplayHonorCode,
    iframeUrl,
    isFRendly,
    children,
  } = hooks.useUnitData({
    courseId,
    format,
    id,
  });

  return (
    <div className="unit">
      <h1 className="mb-0 h3">{unit.title}</h1>
      <h2 className="sr-only">{formatMessage(messages.headerPlaceholder)}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={unit.bookmarkedUpdateState === 'loading'}
      />
      {contentTypeGatingEnabled && unit.containsContentTypeGatedContent && (
        <Suspense
          fallback={(
            <PageLoading
              srMessage={formatMessage(messages.loadingLockedContent)}
            />
          )}
        >
          <LockPaywall courseId={courseId} />
        </Suspense>
      )}
      {shouldDisplayHonorCode && (
        <Suspense
          fallback={(
            <PageLoading
              srMessage={formatMessage(messages.loadingHonorCode)}
            />
          )}
        >
          <HonorCode courseId={courseId} />
        </Suspense>
      )}
      <ContentIFrame
        showContent={!shouldDisplayHonorCode}
        {...(isFRendly ? { childBlocks: children } : { iframeUrl })}
        loadingMessage={formatMessage(messages.loadingSequence)}
        id={id}
        elementId="unit-iframe"
        onLoaded={onLoaded}
        title={unit.title}
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
