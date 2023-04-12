import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { processEvent } from '../../../../course-home/data/thunks';
import { useEventListener } from '../../../../generic/hooks';
import { useModel } from '../../../../generic/model-store';
import { fetchCourse } from '../../../data';

import { FRendlyTypes } from './constants';

const useFetchStudentData = ({
  id,
}) => {
  const [blocks, setBlocks] = useState(null);
  const [children, setChildren] = useState(null);
  const [isFRendly, setIsFRendly] = useState(false);

  const { authenticatedUser } = useContext(AppContext);

  useEffect(() => {
    if (children) {
      setIsFRendly(children.every(child => FRendlyTypes.includes(child.type)));
    }
  }, [children, setIsFRendly]);

  useEffect(() => {
    if (blocks) {
      setChildren(blocks[id].children.map(childID => blocks[childID]));
    }
  }, [blocks, setChildren]);

  useEffect(() => {
    let sequenceUrl;
    if (authenticatedUser) {
      const { username } = authenticatedUser;
      sequenceUrl = `${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/${id}?username=${username}&requested_fields=children&depth=all&student_view_data=video,html`;
      getAuthenticatedHttpClient().get(sequenceUrl).then(response => {
        console.log({ response });
        setBlocks(response.data.blocks);
      });
    }
  }, [authenticatedUser, setBlocks]);
  console.log({ isFRendly, children });
  return { children, isFRendly };
};

const useUnitData = ({
  courseId,
  format,
  id,
}) => {
  const { authenticatedUser } = useContext(AppContext);
  const view = authenticatedUser ? 'student_view' : 'public_view';
  let iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?show_title=0&show_bookmark_button=0&recheck_access=1&view=${view}`;
  if (format) {
    iframeUrl += `&format=${format}`;
  }

  const { isFRendly, children } = useFetchStudentData({ id });

  const [shouldDisplayHonorCode, setShouldDisplayHonorCode] = useState(false);

  const unit = useModel('units', id);
  const course = useModel('coursewareMeta', courseId);
  const {
    contentTypeGatingEnabled,
    userNeedsIntegritySignature,
  } = course;

  useEffect(() => {
    if (userNeedsIntegritySignature && unit.graded) {
      setShouldDisplayHonorCode(true);
    } else {
      setShouldDisplayHonorCode(false);
    }
  }, [userNeedsIntegritySignature]);

  return {
    contentTypeGatingEnabled,
    iframeUrl,
    shouldDisplayHonorCode,
    unit,
    isFRendly,
    children,
  };
};

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
export const useLoadBearingHook = (id) => {
  const setValue = useState(0)[1];
  useLayoutEffect(() => {
    setValue(currentValue => currentValue + 1);
  }, [id]);
};

export const sendUrlHashToFrame = (frame) => {
  const { hash } = window.location;
  if (hash) {
    // The url hash will be sent to LMS-served iframe in order to find the location of the
    // hash within the iframe.
    frame.contentWindow.postMessage({ hashName: hash }, `${getConfig().LMS_BASE_URL}`);
  }
};

const useIFrameBehavior = ({
  id,
  elementId,
  onLoaded,
}) => {
  // Do not remove this hook.  See function description.
  useLoadBearingHook(id);

  const dispatch = useDispatch();

  const [iframeHeight, setIframeHeight] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showError, setShowError] = useState(false);
  const [modalOptions, setModalOptions] = useState({ open: false });

  useEffect(() => {
    sendUrlHashToFrame(document.getElementById(elementId));
  }, [id, setIframeHeight, hasLoaded, iframeHeight, setHasLoaded, onLoaded]);

  const receiveMessage = useCallback(({ data }) => {
    const { type, payload } = data;
    if (type === 'plugin.resize') {
      setIframeHeight(payload.height);
      if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
        setHasLoaded(true);
        if (onLoaded) {
          onLoaded();
        }
      }
    } else if (type === 'plugin.modal') {
      payload.open = true;
      setModalOptions(payload);
    } else if (data.offset) {
      // We listen for this message from LMS to know when the page needs to
      // be scrolled to another location on the page.
      window.scrollTo(0, data.offset + document.getElementById('unit-iframe').offsetTop);
    }
  }, [id, setIframeHeight, hasLoaded, iframeHeight, setHasLoaded, onLoaded]);
  useEventListener('message', receiveMessage);

  /**
  * onLoad *should* only fire after everything in the iframe has finished its own load events.
  * Which means that the plugin.resize message (which calls setHasLoaded above) will have fired already
  * for a successful load. If it *has not fired*, we are in an error state. For example, the backend
  * could have given us a 4xx or 5xx response.
  */
  const handleIFrameLoad = () => {
    if (!hasLoaded) {
      setShowError(true);
    }
    window.onmessage = (e) => {
      if (e.data.event_name) {
        dispatch(processEvent(e.data, fetchCourse));
      }
    };
  };

  const handleCloseModal = () => {
    setModalOptions({ open: false });
  };

  return {
    iframeHeight,
    handleCloseModal,
    modalOptions,
    handleIFrameLoad,
    showError,
    hasLoaded,
  };
};

export default {
  useIFrameBehavior,
  useUnitData,
};
