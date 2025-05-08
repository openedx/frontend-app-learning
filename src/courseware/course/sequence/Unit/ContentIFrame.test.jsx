import React from 'react';

import { ErrorPage } from '@edx/frontend-platform/react';
import { ModalDialog } from '@openedx/paragon';
import { shallow } from '@edx/react-unit-test-utils';

import PageLoading from '@src/generic/PageLoading';

import { ContentIFrameLoaderSlot } from '@src/plugin-slots/ContentIFrameLoaderSlot';
import * as hooks from './hooks';
import ContentIFrame, { IFRAME_FEATURE_POLICY, testIDs } from './ContentIFrame';

jest.mock('@edx/frontend-platform/react', () => ({ ErrorPage: 'ErrorPage' }));

jest.mock('@openedx/paragon', () => jest.requireActual('@edx/react-unit-test-utils')
  .mockComponents({
    ModalDialog: {
      Body: 'ModalDialog.Body',
    },
  }));

jest.mock('@src/generic/PageLoading', () => 'PageLoading');

jest.mock('./hooks', () => ({
  useIFrameBehavior: jest.fn(),
  useModalIFrameData: jest.fn(),
}));

const iframeBehavior = {
  handleIFrameLoad: jest.fn().mockName('IFrameBehavior.handleIFrameLoad'),
  hasLoaded: false,
  iframeHeight: 20,
  showError: false,
};

const modalOptions = {
  closed: {
    isOpen: false,
  },
  withBody: {
    body: 'test-body',
    isOpen: true,
  },
  withUrl: {
    isOpen: true,
    title: 'test-modal-title',
    url: 'test-modal-url',
    height: 'test-height',
  },
};

const modalIFrameData = {
  modalOptions: modalOptions.closed,
  handleModalClose: jest.fn().mockName('modalIFrameOptions.handleModalClose'),
};

hooks.useIFrameBehavior.mockReturnValue(iframeBehavior);
hooks.useModalIFrameData.mockReturnValue(modalIFrameData);

const props = {
  iframeUrl: 'test-iframe-url',
  shouldShowContent: true,
  loadingMessage: 'test-loading-message',
  id: 'test-id',
  elementId: 'test-element-id',
  onLoaded: jest.fn().mockName('props.onLoaded'),
  title: 'test-title',
};

let el;
describe('ContentIFrame Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('behavior', () => {
    beforeEach(() => {
      el = shallow(<ContentIFrame {...props} />);
    });
    it('initializes iframe behavior hook', () => {
      expect(hooks.useIFrameBehavior).toHaveBeenCalledWith({
        elementId: props.elementId,
        id: props.id,
        iframeUrl: props.iframeUrl,
        onLoaded: props.onLoaded,
      });
    });
    it('initializes modal iframe data', () => {
      expect(hooks.useModalIFrameData).toHaveBeenCalledWith();
    });
  });
  describe('output', () => {
    let component;
    describe('if shouldShowContent', () => {
      describe('if not hasLoaded', () => {
        it('displays errorPage if showError', () => {
          hooks.useIFrameBehavior.mockReturnValueOnce({ ...iframeBehavior, showError: true });
          el = shallow(<ContentIFrame {...props} />);
          expect(el.instance.findByType(ErrorPage).length).toEqual(1);
        });
        it('displays PageLoading component if not showError', () => {
          el = shallow(<ContentIFrame {...props} />);
          [component] = el.instance.findByType(ContentIFrameLoaderSlot);
          expect(component.props.loadingMessage).toEqual(props.loadingMessage);
        });
      });
      describe('hasLoaded', () => {
        it('does not display PageLoading or ErrorPage', () => {
          hooks.useIFrameBehavior.mockReturnValueOnce({ ...iframeBehavior, hasLoaded: true });
          el = shallow(<ContentIFrame {...props} />);
          expect(el.instance.findByType(PageLoading).length).toEqual(0);
          expect(el.instance.findByType(ErrorPage).length).toEqual(0);
        });
      });
      it('display iframe with props from hooks', () => {
        el = shallow(<ContentIFrame {...props} />);
        [component] = el.instance.findByTestId(testIDs.contentIFrame);
        expect(component.props).toEqual({
          allow: IFRAME_FEATURE_POLICY,
          allowFullScreen: true,
          scrolling: 'no',
          referrerPolicy: 'origin',
          title: props.title,
          id: props.elementId,
          src: props.iframeUrl,
          height: iframeBehavior.iframeHeight,
          onLoad: iframeBehavior.handleIFrameLoad,
          'data-testid': testIDs.contentIFrame,
        });
      });
    });
    describe('if not shouldShowContent', () => {
      it('does not show PageLoading, ErrorPage, or unit-iframe-wrapper', () => {
        el = shallow(<ContentIFrame {...{ ...props, shouldShowContent: false }} />);
        expect(el.instance.findByType(PageLoading).length).toEqual(0);
        expect(el.instance.findByType(ErrorPage).length).toEqual(0);
        expect(el.instance.findByTestId(testIDs.contentIFrame).length).toEqual(0);
      });
    });
    it('does not display modal if modalOptions returns isOpen: false', () => {
      el = shallow(<ContentIFrame {...props} />);
      expect(el.instance.findByType(ModalDialog).length).toEqual(0);
    });
    describe('if modalOptions.isOpen', () => {
      const testModalOpenAndHandleClose = () => {
        test('Modal component isOpen, with handleModalClose from hook', () => {
          expect(component.props.onClose).toEqual(modalIFrameData.handleModalClose);
        });
      };
      describe('fullscreen modal', () => {
        describe('body modal', () => {
          beforeEach(() => {
            hooks.useModalIFrameData.mockReturnValueOnce({
              ...modalIFrameData,
              modalOptions: { ...modalOptions.withBody, isFullscreen: true },
            });
            el = shallow(<ContentIFrame {...props} />);
            [component] = el.instance.findByType(ModalDialog);
          });
          it('displays Modal with div wrapping provided body content if modal.body is provided', () => {
            const content = component.findByType(ModalDialog.Body)[0].children[0];
            expect(content.matches(shallow(
              <div className="unit-modal">{modalOptions.withBody.body}</div>,
            ))).toEqual(true);
          });
          testModalOpenAndHandleClose();
        });
        describe('url modal', () => {
          beforeEach(() => {
            hooks.useModalIFrameData
              .mockReturnValueOnce({
                ...modalIFrameData,
                modalOptions: { ...modalOptions.withUrl, isFullscreen: true },
              });
            el = shallow(<ContentIFrame {...props} />);
            [component] = el.instance.findByType(ModalDialog);
          });
          testModalOpenAndHandleClose();
          it('displays Modal with iframe to provided url if modal.body is not provided', () => {
            const content = component.findByType(ModalDialog.Body)[0].children[0];
            expect(content.matches(shallow(
              <iframe
                title={modalOptions.withUrl.title}
                allow={IFRAME_FEATURE_POLICY}
                frameBorder="0"
                src={modalOptions.withUrl.url}
                style={{ width: '100%', height: modalOptions.withUrl.height }}
              />,
            ))).toEqual(true);
          });
        });
      });
      describe('body modal', () => {
        beforeEach(() => {
          hooks.useModalIFrameData.mockReturnValueOnce({ ...modalIFrameData, modalOptions: modalOptions.withBody });
          el = shallow(<ContentIFrame {...props} />);
          [component] = el.instance.findByType(ModalDialog);
        });
        it('displays Modal with div wrapping provided body content if modal.body is provided', () => {
          const content = component.findByType(ModalDialog.Body)[0].children[0];
          expect(content.matches(shallow(<div className="unit-modal">{modalOptions.withBody.body}</div>))).toEqual(true);
        });
        testModalOpenAndHandleClose();
      });
      describe('url modal', () => {
        beforeEach(() => {
          hooks.useModalIFrameData.mockReturnValueOnce({ ...modalIFrameData, modalOptions: modalOptions.withUrl });
          el = shallow(<ContentIFrame {...props} />);
          [component] = el.instance.findByType(ModalDialog);
        });
        testModalOpenAndHandleClose();
        it('displays Modal with iframe to provided url if modal.body is not provided', () => {
          const content = component.findByType(ModalDialog.Body)[0].children[0];
          expect(content.matches(shallow(
            <iframe
              title={modalOptions.withUrl.title}
              allow={IFRAME_FEATURE_POLICY}
              frameBorder="0"
              src={modalOptions.withUrl.url}
              style={{ width: '100%', height: modalOptions.withUrl.height }}
            />,
          ))).toEqual(true);
        });
      });
    });
  });
});
