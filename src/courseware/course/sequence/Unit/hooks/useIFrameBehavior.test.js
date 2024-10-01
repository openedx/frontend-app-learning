import React from 'react';
import { useDispatch } from 'react-redux';

import { getEffects, mockUseKeyedState } from '@edx/react-unit-test-utils';
import { logError } from '@edx/frontend-platform/logging';

import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { fetchCourse } from '@src/courseware/data';
import { processEvent } from '@src/course-home/data/thunks';
import { useEventListener } from '@src/generic/hooks';

import { messageTypes } from '../constants';

import useIFrameBehavior, { stateKeys } from './useIFrameBehavior';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics');

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useCallback: jest.fn((cb, prereqs) => ({ cb, prereqs })),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  throttle: jest.fn((fn) => fn),
}));

jest.mock('./useLoadBearingHook', () => jest.fn());

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

const state = mockUseKeyedState(stateKeys);

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

describe('useIFrameBehavior hook', () => {
  let hook;
  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
    global.document.getElementById = mockGetElementById;
    global.window.addEventListener = jest.fn();
    global.window.removeEventListener = jest.fn();
    global.window.innerHeight = 800;
  });
  afterEach(() => {
    state.resetVals();
  });
  describe('behavior', () => {
    it('initializes iframe height to 0 and error/loaded values to false', () => {
      hook = useIFrameBehavior(props);
      state.expectInitializedWith(stateKeys.iframeHeight, 0);
      state.expectInitializedWith(stateKeys.hasLoaded, false);
      state.expectInitializedWith(stateKeys.showError, false);
      state.expectInitializedWith(stateKeys.windowTopOffset, null);
    });
    describe('effects - on frame change', () => {
      let oldGetElement;
      beforeEach(() => {
        global.window ??= Object.create(window);
        Object.defineProperty(window, 'location', { value: {}, writable: true });
        state.mockVals(stateVals);
        oldGetElement = document.getElementById;
        document.getElementById = mockGetElementById;
      });
      afterEach(() => {
        state.resetVals();
        document.getElementById = oldGetElement;
      });
      it('does not post url hash if the window does not have one', () => {
        hook = useIFrameBehavior(props);
        const cb = getEffects([
          props.id,
          props.onLoaded,
          testIFrameHeight,
          true,
        ], React)[0];
        cb();
        expect(postMessage).not.toHaveBeenCalled();
      });
      it('posts url hash if the window has one', () => {
        window.location.hash = testHash;
        hook = useIFrameBehavior(props);
        const cb = getEffects([
          props.id,
          props.onLoaded,
          testIFrameHeight,
          true,
        ], React)[0];
        cb();
        expect(postMessage).toHaveBeenCalledWith({ hashName: testHash }, config.LMS_BASE_URL);
      });
    });
    describe('event listener', () => {
      it('calls eventListener with prepared callback', () => {
        state.mockVals(stateVals);
        hook = useIFrameBehavior(props);
        const [call] = useEventListener.mock.calls;
        expect(call[0]).toEqual('message');
        expect(call[1].prereqs).toEqual([
          props.id,
          props.onLoaded,
          state.values.hasLoaded,
          state.setState.hasLoaded,
          state.values.iframeHeight,
          state.setState.iframeHeight,
          state.values.windowTopOffset,
          state.setState.windowTopOffset,
        ]);
      });
      describe('resize message', () => {
        const resizeMessage = (height = 23) => ({
          data: { type: messageTypes.resize, payload: { height } },
        });
        const videoFullScreenMessage = (open = false) => ({
          data: { type: messageTypes.videoFullScreen, payload: { open } },
        });
        const testSetIFrameHeight = (height = 23) => {
          const { cb } = useEventListener.mock.calls[0][1];
          cb(resizeMessage(height));
          expect(state.setState.iframeHeight).toHaveBeenCalledWith(height);
        };
        const testOnlySetsHeight = () => {
          it('sets iframe height with payload height', () => {
            testSetIFrameHeight();
          });
          it('does not set hasLoaded', () => {
            expect(state.setState.hasLoaded).not.toHaveBeenCalled();
          });
        };
        describe('hasLoaded', () => {
          beforeEach(() => {
            state.mockVals({ ...defaultStateVals, hasLoaded: true });
            hook = useIFrameBehavior(props);
          });
          testOnlySetsHeight();
        });
        describe('iframeHeight is not 0', () => {
          beforeEach(() => {
            state.mockVals({ ...defaultStateVals, hasLoaded: true });
            hook = useIFrameBehavior(props);
          });
          testOnlySetsHeight();
        });
        describe('payload height is 0', () => {
          beforeEach(() => { hook = useIFrameBehavior(props); });
          testOnlySetsHeight(0);
        });
        describe('payload is present but uninitialized', () => {
          it('sets iframe height with payload height', () => {
            hook = useIFrameBehavior(props);
            testSetIFrameHeight();
          });
          it('sets hasLoaded and calls onLoaded', () => {
            hook = useIFrameBehavior(props);
            const { cb } = useEventListener.mock.calls[0][1];
            cb(resizeMessage());
            expect(state.setState.hasLoaded).toHaveBeenCalledWith(true);
            expect(props.onLoaded).toHaveBeenCalled();
          });
          test('onLoaded is optional', () => {
            hook = useIFrameBehavior({ ...props, onLoaded: undefined });
            const { cb } = useEventListener.mock.calls[0][1];
            cb(resizeMessage());
            expect(state.setState.hasLoaded).toHaveBeenCalledWith(true);
          });
        });
        it('scrolls to current window vertical offset if one is set', () => {
          const windowTopOffset = 32;
          state.mockVals({ ...defaultStateVals, windowTopOffset });
          hook = useIFrameBehavior(props);
          const { cb } = useEventListener.mock.calls[0][1];
          cb(videoFullScreenMessage());
          expect(window.scrollTo).toHaveBeenCalledWith(0, windowTopOffset);
        });
        it('does not scroll if towverticalp offset is not set', () => {
          hook = useIFrameBehavior(props);
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
          hook = useIFrameBehavior(props);
          [[, { cb }]] = useEventListener.mock.calls;
        });
        it('sets window top offset based on window.scrollY if opening the video', () => {
          cb(fullScreenMessage(true));
          expect(state.setState.windowTopOffset).toHaveBeenCalledWith(scrollY);
        });
        it('sets window top offset to null if closing the video', () => {
          cb(fullScreenMessage(false));
          expect(state.setState.windowTopOffset).toHaveBeenCalledWith(null);
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
          hook = useIFrameBehavior(props);
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
        state.mockVals({ ...defaultStateVals, hasLoaded: true });
        useIFrameBehavior(props);

        const effects = getEffects([true, props.elementId], React);
        expect(effects.length).toEqual(2);
        effects[0](); // Execute the visibility tracking effect.

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
        state.mockVals({ ...defaultStateVals, hasLoaded: false });
        useIFrameBehavior(props);

        const effects = getEffects([false, props.elementId], React);
        expect(effects).toBeNull();

        expect(global.window.addEventListener).not.toHaveBeenCalled();
        expect(postMessage).not.toHaveBeenCalled();
      });
      it('cleans up event listeners on unmount', () => {
        state.mockVals({ ...defaultStateVals, hasLoaded: true });
        useIFrameBehavior(props);

        const effects = getEffects([true, props.elementId], React);
        const cleanup = effects[0](); // Execute the effect and get the cleanup function.
        cleanup(); // Call the cleanup function.

        expect(global.window.removeEventListener).toHaveBeenCalledTimes(2);
        expect(global.window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(global.window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      });
    });
  });
  describe('output', () => {
    describe('handleIFrameLoad', () => {
      it('sets and logs error if has not loaded', () => {
        hook = useIFrameBehavior(props);
        hook.handleIFrameLoad();
        expect(state.setState.showError).toHaveBeenCalledWith(true);
        expect(logError).toHaveBeenCalled();
      });
      it('sends track event if has not loaded', () => {
        hook = useIFrameBehavior(props);
        hook.handleIFrameLoad();
        const eventName = 'edx.bi.error.learning.iframe_load_failed';
        const eventProperties = {
          unitId: props.id,
          iframeUrl: props.iframeUrl,
        };
        expect(sendTrackEvent).toHaveBeenCalledWith(eventName, eventProperties);
      });
      it('does not set/log errors if loaded', () => {
        state.mockVals({ ...defaultStateVals, hasLoaded: true });
        hook = useIFrameBehavior(props);
        hook.handleIFrameLoad();
        expect(state.setState.showError).not.toHaveBeenCalled();
        expect(logError).not.toHaveBeenCalled();
      });
      it('does not send track event if loaded', () => {
        state.mockVals({ ...defaultStateVals, hasLoaded: true });
        hook = useIFrameBehavior(props);
        hook.handleIFrameLoad();
        expect(sendTrackEvent).not.toHaveBeenCalled();
      });
      it('registers an event handler to process fetchCourse events.', () => {
        hook = useIFrameBehavior(props);
        hook.handleIFrameLoad();
        const eventName = 'test-event-name';
        const event = { data: { event_name: eventName } };
        window.onmessage(event);
        expect(dispatch).toHaveBeenCalledWith(processEvent(event.data, fetchCourse));
      });
    });
    it('forwards handleIframeLoad, showError, and hasLoaded from state fields', () => {
      state.mockVals(stateVals);
      hook = useIFrameBehavior(props);
      expect(hook.iframeHeight).toEqual(stateVals.iframeHeight);
      expect(hook.showError).toEqual(stateVals.showError);
      expect(hook.hasLoaded).toEqual(stateVals.hasLoaded);
    });
  });
});
