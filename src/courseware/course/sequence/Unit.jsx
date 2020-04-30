import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import BookmarkButton from '../bookmark/BookmarkButton';
import { useModel } from '../../../model-store';
import PageLoading from '../../../PageLoading';

const LockPaywall = React.lazy(() => import('./lock-paywall'));

/**
 * We discovered an error in Firefox where - upon iframe load - React would cease to call any
 * useEffect hooks until the user interacts with the page again.  This is particularly confusing
 * when navigating between sequences, as the UI partially updates leaving the user in a nebulous
 * state.
 *
 * We were able to solve this error by using a layout effect to update some component state, which
 * executes synchronously on render.  Somehow this forces React to continue it's lifecycle
 * immediately, rather than waiting for user interaction.  This layout effect could be anywhere in
 * the parent tree, as far as we can tell - we chose to add a conspicuously 'load bearing' (that's
 * a joke) one here so it wouldn't be accidentally removed elsewhere.
 *
 * If we remove this hook when one of these happens:
 * 1. React figures out that there's an issue here and fixes a bug.
 * 2. We cease to use an iframe for unit rendering.
 * 3. Firefox figures out that there's an issue in their iframe loading and fixes a bug.
 * 4. We stop supporting Firefox.
 * 5. An enterprising engineer decides to create a repo that reproduces the problem, submits it to
 *    Firefox/React for review, and they kindly help us figure out what in the world is happening
 *    so  we can fix it.
 *
 * This hook depends on the unit id just to make sure it re-evaluates whenever the ID changes.  If
 * we change whether or not the Unit component is re-mounted when the unit ID changes, this may
 * become important, as this hook will otherwise only evaluate the useLayoutEffect once.
 */
function useLoadBearingHook(id) {
  const setValue = useState(0)[1];
  useLayoutEffect(() => {
    setValue(currentValue => currentValue + 1);
  }, [id]);
}

function Unit({
  courseId,
  onLoaded,
  id,
  intl,
}) {
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?show_title=0&show_bookmark_button=0`;

  const [iframeHeight, setIframeHeight] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const unit = useModel('units', id);
  const course = useModel('courses', courseId);
  const {
    contentTypeGatingEnabled,
    enrollmentMode,
  } = course;

  // Do not remove this hook.  See function description.
  useLoadBearingHook(id);

  // We use this ref so that we can hold a reference to the currently active event listener.
  const messageEventListenerRef = useRef(null);
  useEffect(() => {
    function receiveMessage(event) {
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
    }
    // If we currently have an event listener, remove it.
    if (messageEventListenerRef.current !== null) {
      global.removeEventListener('message', messageEventListenerRef.current);
      messageEventListenerRef.current = null;
    }
    // Now add our new receiveMessage handler as the event listener.
    global.addEventListener('message', receiveMessage);
    // And then save it to our ref for next time.
    messageEventListenerRef.current = receiveMessage;
    // When the component finally unmounts, use the ref to remove the correct handler.
    return () => global.removeEventListener('message', messageEventListenerRef.current);
  }, [id, setIframeHeight, hasLoaded, iframeHeight, setHasLoaded, onLoaded]);

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
