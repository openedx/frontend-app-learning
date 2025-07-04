import { useDispatch } from 'react-redux';
import { renderHook } from '@testing-library/react';

import { logError } from '@edx/frontend-platform/logging';

import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { fetchCourse } from '@src/courseware/data';
import { processEvent } from '@src/course-home/data/thunks';
import { useEventListener } from '@src/generic/hooks';
import { useSequenceNavigationMetadata } from '@src/courseware/course/sequence/sequence-navigation/hooks';

import { messageTypes } from '../constants';

import useIFrameBehavior, { iframeBehaviorState } from './useIFrameBehavior';

const mockNavigate = jest.fn();

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics');

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ cb, prereqs })),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@src/courseware/data', () => ({
  fetchCourse: jest.fn(),
}));
jest.mock('@src/course-home/data/thunks', () => ({
  processEvent: jest.fn((...args) => ({ processEvent: args })),
}));
jest.mock('@src/generic/hooks', () => ({
  useEventListener: jest.fn(),
}));
jest.mock('@src/generic/model-store', () => ({
  useModel: () => ({ unitIds: ['unit1', 'unit2'], entranceExamData: { entranceExamPassed: null } }),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@src/courseware/course/sequence/sequence-navigation/hooks');
useSequenceNavigationMetadata.mockReturnValue({ isLastUnit: false, nextLink: '/next-unit-link' });

const props = {
  elementId: 'test-element-id',
  id: 'test-id',
  iframeUrl: 'test-iframe-url',
  onLoaded: jest.fn(),
};

const testIFrameHeight = 42;

const config = { LMS_BASE_URL: 'test-base-url' };
getConfig.mockReturnValue(config);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

const postMessage = jest.fn();
const frame = {
  contentWindow: { postMessage },
  getBoundingClientRect: jest.fn(() => ({ top: 100 })),
};
const mockGetElementById = jest.fn(() => frame);
const testHash = '#test-hash';

const defaultStateVals = {
  iframeHeight: 0,
  hasLoaded: false,
  showError: false,
  windowTopOffset: null,
};

const stateVals = {
  iframeHeight: testIFrameHeight,
  hasLoaded: true,
  showError: true,
  windowTopOffset: 32,
};

const setIframeHeight = jest.fn();
const setHasLoaded = jest.fn();
const setShowError = jest.fn();
const setWindowTopOffset = jest.fn();

const mockState = (state) => {
  const { iframeHeight, hasLoaded, showError, windowTopOffset } = state;
  if ('iframeHeight' in state) jest.spyOn(iframeBehaviorState, 'iframeHeight').mockImplementation(() => [iframeHeight, setIframeHeight]);
  if ('hasLoaded' in state) jest.spyOn(iframeBehaviorState, 'hasLoaded').mockImplementation(() => [hasLoaded, setHasLoaded]);
  if ('showError' in state) jest.spyOn(iframeBehaviorState, 'showError').mockImplementation(() => [showError, setShowError]);
  if ('windowTopOffset' in state) jest.spyOn(iframeBehaviorState, 'windowTopOffset').mockImplementation(() => [windowTopOffset, setWindowTopOffset]);
};

describe('useIFrameBehavior hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.document.getElementById = mockGetElementById;
    global.window.addEventListener = jest.fn();
    global.window.removeEventListener = jest.fn();
    global.window.innerHeight = 800;
  });
  describe('behavior', () => {
    it('initializes iframe height to 0 and error/loaded values to false', () => {
      mockState(defaultStateVals);
      const { result } = renderHook(() => useIFrameBehavior(props));

      expect(result.current.iframeHeight).toBe(0);
      expect(result.current.showError).toBe(false);
      expect(result.current.hasLoaded).toBe(false);
    });
    describe('effects - on frame change', () => {
      let oldGetElement;
      beforeEach(() => {
        global.window ??= Object.create(window);
        Object.defineProperty(window, 'location', { value: {}, writable: true });
        oldGetElement = document.getElementById;
        document.getElementById = mockGetElementById;
        mockState(defaultStateVals);
      });
      afterEach(() => {
        jest.clearAllMocks();
        document.getElementById = oldGetElement;
      });
      it('does not post url hash if the window does not have one', () => {
        window.location.hash = '';
        renderHook(() => useIFrameBehavior(props));
        expect(postMessage).not.toHaveBeenCalled();
      });
      it('posts url hash if the window has one', () => {
        window.location.hash = testHash;
        renderHook(() => useIFrameBehavior(props));
        expect(postMessage).toHaveBeenCalledWith({ hashName: testHash }, config.LMS_BASE_URL);
      });
    });
    describe('event listener', () => {
      it('calls eventListener with prepared callback', () => {
        mockState(stateVals);
        renderHook(() => useIFrameBehavior(props));
        const [call] = useEventListener.mock.calls;
        expect(call[0]).toEqual('message');
        expect(call[1].prereqs).toEqual([
          props.id,
          props.onLoaded,
          stateVals.hasLoaded,
          setHasLoaded,
          stateVals.iframeHeight,
          setIframeHeight,
          stateVals.windowTopOffset,
          setWindowTopOffset,
        ]);
      });
      describe('resize message', () => {
        const height = 23;
        const resizeMessage = (height = 23) => ({
          data: { type: messageTypes.resize, payload: { height } },
        });
        const videoFullScreenMessage = (open = false) => ({
          data: { type: messageTypes.videoFullScreen, payload: { open } },
        });
        const testSetIFrameHeight = (height = 23) => {
          const { cb } = useEventListener.mock.calls[0][1];
          cb(resizeMessage(height));
          expect(setIframeHeight).toHaveBeenCalledWith(height);
        };
        describe('hasLoaded', () => {
          it('sets iframe height with payload height', () => {
            mockState({ ...defaultStateVals, hasLoaded: true });
            renderHook(() => useIFrameBehavior(props));
            const { cb } = useEventListener.mock.calls[0][1];
            cb(resizeMessage(height));
            expect(setIframeHeight).toHaveBeenCalledWith(0);
            expect(setIframeHeight).toHaveBeenCalledWith(height);
          });
        });
        describe('payload height is 0', () => {
          it('sets iframe height with payload height', () => {
            mockState(defaultStateVals);
            renderHook(() => useIFrameBehavior(props));
            const { cb } = useEventListener.mock.calls[0][1];
            cb(resizeMessage(0));
            expect(setIframeHeight).toHaveBeenCalledWith(0);
            expect(setIframeHeight).not.toHaveBeenCalledWith(height);
          });
        });
        describe('payload is present but uninitialized', () => {
          beforeEach(() => {
            mockState(defaultStateVals);
          });
          it('sets iframe height with payload height', () => {
            renderHook(() => useIFrameBehavior(props));
            testSetIFrameHeight();
          });
          it('sets hasLoaded and calls onLoaded', () => {
            renderHook(() => useIFrameBehavior(props));
            const { cb } = useEventListener.mock.calls[0][1];
            cb(resizeMessage());
            expect(setHasLoaded).toHaveBeenCalledWith(true);
            expect(props.onLoaded).toHaveBeenCalled();
          });
          test('onLoaded is optional', () => {
            renderHook(() => useIFrameBehavior({ ...props, onLoaded: undefined }));
            const { cb } = useEventListener.mock.calls[0][1];
            cb(resizeMessage());
            expect(setHasLoaded).toHaveBeenCalledWith(true);
          });
        });
        it('scrolls to current window vertical offset if one is set', () => {
          const windowTopOffset = 32;
          mockState({ ...defaultStateVals, windowTopOffset });
          renderHook(() => useIFrameBehavior(props));
          const { cb } = useEventListener.mock.calls[0][1];
          cb(videoFullScreenMessage());
          expect(window.scrollTo).toHaveBeenCalledWith(0, windowTopOffset);
        });
        it('does not scroll if towverticalp offset is not set', () => {
          renderHook(() => useIFrameBehavior(props));
          const { cb } = useEventListener.mock.calls[0][1];
          cb(resizeMessage());
          expect(window.scrollTo).not.toHaveBeenCalled();
        });
      });
      describe('video fullscreen message', () => {
        let cb;
        const scrollY = 23;
        const fullScreenMessage = (open) => ({
          data: { type: messageTypes.videoFullScreen, payload: { open } },
        });
        beforeEach(() => {
          window.scrollY = scrollY;
          renderHook(() => useIFrameBehavior(props));
          [[, { cb }]] = useEventListener.mock.calls;
        });
        it('sets window top offset based on window.scrollY if opening the video', () => {
          cb(fullScreenMessage(true));
          expect(setWindowTopOffset).toHaveBeenCalledWith(scrollY);
        });
        it('sets window top offset to null if closing the video', () => {
          cb(fullScreenMessage(false));
          expect(setWindowTopOffset).toHaveBeenCalledWith(null);
        });
      });
      describe('offset message', () => {
        it('scrolls to data offset', () => {
          const offsetTop = 44;
          const mockGetEl = jest.fn(() => ({ offsetTop }));

          const oldGetElement = document.getElementById;
          document.getElementById = mockGetEl;
          const oldScrollTo = window.scrollTo;
          window.scrollTo = jest.fn();
          renderHook(() => useIFrameBehavior(props));
          const { cb } = useEventListener.mock.calls[0][1];
          const offset = 99;
          cb({ data: { offset } });
          expect(window.scrollTo).toHaveBeenCalledWith(0, offset + offsetTop);
          expect(mockGetEl).toHaveBeenCalledWith('unit-iframe');
          document.getElementById = oldGetElement;
          window.scrollTo = oldScrollTo;
        });
      });
    });
    describe('visibility tracking', () => {
      it('sets up visibility tracking after iframe has loaded', () => {
        mockState({ ...defaultStateVals, hasLoaded: true });
        
        renderHook(() => useIFrameBehavior(props));

        expect(global.window.addEventListener).toHaveBeenCalledTimes(2);
        expect(global.window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(global.window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        // Initial visibility update.
        expect(postMessage).toHaveBeenCalledWith(
          {
            type: 'unit.visibilityStatus',
            data: {
              topPosition: 100,
              viewportHeight: 800,
            },
          },
          config.LMS_BASE_URL,
        );
      });
      it('does not set up visibility tracking before iframe has loaded', () => {
        window.location.hash = ''; // Avoid posting hash message.
        mockState({ ...defaultStateVals, hasLoaded: false });
        renderHook(() => useIFrameBehavior(props));

        expect(global.window.addEventListener).not.toHaveBeenCalled();
        expect(postMessage).not.toHaveBeenCalled();
      });
      it('cleans up event listeners on unmount', () => {
        mockState({ ...defaultStateVals, hasLoaded: true });
        const { unmount } = renderHook(() => useIFrameBehavior(props));

        unmount(); // Call the cleanup function.

        expect(global.window.removeEventListener).toHaveBeenCalledTimes(2);
        expect(global.window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(global.window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      });
    });
  });
  describe('output', () => {
    describe('handleIFrameLoad', () => {
      it('sets and logs error if has not loaded', () => {
        mockState(defaultStateVals);
        const { result } = renderHook(() => useIFrameBehavior(props));
        result.current.handleIFrameLoad();
        expect(setShowError).toHaveBeenCalledWith(true);
        expect(logError).toHaveBeenCalled();
      });
      it('sends track event if has not loaded', () => {
        mockState(defaultStateVals);
        const { result } = renderHook(() => useIFrameBehavior(props));
        result.current.handleIFrameLoad();
        const eventName = 'edx.bi.error.learning.iframe_load_failed';
        const eventProperties = {
          unitId: props.id,
          iframeUrl: props.iframeUrl,
        };
        expect(sendTrackEvent).toHaveBeenCalledWith(eventName, eventProperties);
      });
      it('does not set/log errors if loaded', () => {
        mockState({ ...defaultStateVals, hasLoaded: true });
        const { result } = renderHook(() => useIFrameBehavior(props));
        result.current.handleIFrameLoad();
        expect(setShowError).not.toHaveBeenCalled();
        expect(logError).not.toHaveBeenCalled();
      });
      it('does not send track event if loaded', () => {
        mockState({ ...defaultStateVals, hasLoaded: true });
        const { result } = renderHook(() => useIFrameBehavior(props));
        result.current.handleIFrameLoad();
        expect(sendTrackEvent).not.toHaveBeenCalled();
      });
      it('registers an event handler to process fetchCourse events.', () => {
        mockState(defaultStateVals);
        const { result } = renderHook(() => useIFrameBehavior(props));
        result.current.handleIFrameLoad();
        const eventName = 'test-event-name';
        const event = { data: { event_name: eventName } };
        window.onmessage(event);
        expect(dispatch).toHaveBeenCalledWith(processEvent(event.data, fetchCourse));
      });
    });
    it('forwards handleIframeLoad, showError, and hasLoaded from state fields', () => {
      mockState(stateVals);
      const { result } = renderHook(() => useIFrameBehavior(props));
      expect(result.current.iframeHeight).toBe(stateVals.iframeHeight);
      expect(result.current.showError).toBe(stateVals.showError);
      expect(result.current.hasLoaded).toBe(stateVals.hasLoaded);
    });
  });
  describe('navigate link for the next unit on auto advance', () => {
    it('test for link when it is not last unit', () => {
      mockState(defaultStateVals);
      renderHook(() => useIFrameBehavior(props));
      const { cb } = useEventListener.mock.calls[0][1];
      const autoAdvanceMessage = () => ({
        data: { type: messageTypes.autoAdvance },
      });
      cb(autoAdvanceMessage());
      expect(mockNavigate).toHaveBeenCalledWith('/next-unit-link');
    });
    it('test for link when it is last unit', () => {
      mockState(defaultStateVals);
      useSequenceNavigationMetadata.mockReset();
      useSequenceNavigationMetadata.mockReturnValue({ isLastUnit: true, nextLink: '/next-unit-link' });
      renderHook(() => useIFrameBehavior(props));
      const { cb } = useEventListener.mock.calls[0][1];
      const autoAdvanceMessage = () => ({
        data: { type: messageTypes.autoAdvance },
      });
      cb(autoAdvanceMessage());
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
