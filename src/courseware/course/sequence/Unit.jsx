import React, {
  Suspense,
  useRef,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import BookmarkButton from '../bookmark/BookmarkButton';
import { useModel } from '../../../model-store';
import PageLoading from '../../../PageLoading';

const LockPaywall = React.lazy(() => import('./lock-paywall'));

function Unit({
  courseId,
  onLoaded,
  id,
  intl,
}) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?show_title=0&show_bookmark_button=0`;

  const [iframeHeight, setIframeHeight] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const unit = useModel('units', id);
  const course = useModel('courses', courseId);
  const {
    contentTypeGatingEnabled,
    enrollmentMode,
  } = course;

  useEffect(() => {
    global.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'plugin.resize') {
        setIframeHeight(payload.height);
        if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
          setHasLoaded(true);
          if (onLoaded) {
            onLoaded();
          }
        }
      }
    };
  }, []);

  return (
    <div className="unit">
      <h2 className="mb-0 h4">{unit.title}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={unit.bookmarkedUpdateState === 'loading'}
      />
      { contentTypeGatingEnabled && unit.graded && enrollmentMode === 'audit' && (
        <Suspense
          fallback={(
            <PageLoading
              srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
            />
          )}
        >
          <LockPaywall
            courseId={courseId}
          />
        </Suspense>
      )}
      <div className="unit-iframe-wrapper">
        <iframe
          id="unit-iframe"
          title={unit.title}
          ref={iframeRef}
          src={iframeUrl}
          allowFullScreen
          height={iframeHeight}
          scrolling="no"
          referrerPolicy="origin"
        />
      </div>
    </div>
  );
}

Unit.propTypes = {
  courseId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  onLoaded: PropTypes.func,
};

Unit.defaultProps = {
  onLoaded: undefined,
};

export default injectIntl(Unit);
