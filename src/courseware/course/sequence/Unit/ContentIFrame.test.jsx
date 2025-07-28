import { render, screen } from '@testing-library/react';

import * as hooks from './hooks';
import ContentIFrame, { IFRAME_FEATURE_POLICY } from './ContentIFrame';

jest.mock('@edx/frontend-platform/react', () => ({ ErrorPage: () => <div>ErrorPage</div> }));

jest.mock('@src/generic/PageLoading', () => jest.fn(() => <div>PageLoading</div>));

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

describe('ContentIFrame Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('behavior', () => {
    beforeEach(() => {
      render(<ContentIFrame {...props} />);
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
    describe('if shouldShowContent', () => {
      describe('if not hasLoaded', () => {
        it('displays errorPage if showError', () => {
          hooks.useIFrameBehavior.mockReturnValueOnce({ ...iframeBehavior, showError: true });
          render(<ContentIFrame {...props} />);
          const errorPage = screen.getByText('ErrorPage');
          expect(errorPage).toBeInTheDocument();
        });
        it('displays PageLoading component if not showError', () => {
          render(<ContentIFrame {...props} />);
          const pageLoading = screen.getByText('PageLoading');
          expect(pageLoading).toBeInTheDocument();
        });
      });
      describe('hasLoaded', () => {
        it('does not display PageLoading or ErrorPage', () => {
          hooks.useIFrameBehavior.mockReturnValueOnce({ ...iframeBehavior, hasLoaded: true });
          render(<ContentIFrame {...props} />);
          const pageLoading = screen.queryByText('PageLoading');
          expect(pageLoading).toBeNull();
          const errorPage = screen.queryByText('ErrorPage');
          expect(errorPage).toBeNull();
        });
      });
      it('display iframe with props from hooks', () => {
        render(<ContentIFrame {...props} />);
        const iframe = screen.getByTitle(props.title);
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('id', props.elementId);
        expect(iframe).toHaveAttribute('src', props.iframeUrl);
        expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
        expect(iframe).toHaveAttribute('allowfullscreen', '');
        expect(iframe).toHaveAttribute('scrolling', 'no');
        expect(iframe).toHaveAttribute('referrerpolicy', 'origin');
      });
    });
    describe('if not shouldShowContent', () => {
      it('does not show PageLoading, ErrorPage, or unit-iframe-wrapper', () => {
        render(<ContentIFrame {...{ ...props, shouldShowContent: false }} />);
        expect(screen.queryByText('PageLoading')).toBeNull();
        expect(screen.queryByText('ErrorPage')).toBeNull();
        expect(screen.queryByTitle(props.title)).toBeNull();
      });
    });
    it('does not display modal if modalOptions returns isOpen: false', () => {
      render(<ContentIFrame {...props} />);
      const modal = screen.queryByRole('dialog');
      expect(modal).toBeNull();
    });
    describe('if modalOptions.isOpen', () => {
      const testModalOpenAndHandleClose = () => {
        it('closes modal on close button click', () => {
          const closeButton = screen.getByTestId('modal-backdrop');
          closeButton.click();
          expect(modalIFrameData.handleModalClose).toHaveBeenCalled();
        });
      };
      describe('fullscreen modal', () => {
        describe('body modal', () => {
          beforeEach(() => {
            hooks.useModalIFrameData.mockReturnValueOnce({
              ...modalIFrameData,
              modalOptions: { ...modalOptions.withBody, isFullscreen: true },
            });
            render(<ContentIFrame {...props} />);
          });
          it('displays Modal with div wrapping provided body content if modal.body is provided', () => {
            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
            const modalBody = screen.getByText(modalOptions.withBody.body);
            expect(modalBody).toBeInTheDocument();
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
            render(<ContentIFrame {...props} />);
          });
          it('displays Modal with iframe to provided url if modal.body is not provided', () => {
            const iframe = screen.getByTitle(modalOptions.withUrl.title);
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
            expect(iframe).toHaveAttribute('src', modalOptions.withUrl.url);
          });
          testModalOpenAndHandleClose();
        });
      });
      describe('body modal', () => {
        beforeEach(() => {
          hooks.useModalIFrameData.mockReturnValueOnce({ ...modalIFrameData, modalOptions: modalOptions.withBody });
          render(<ContentIFrame {...props} />);
        });
        it('displays Modal with div wrapping provided body content if modal.body is provided', () => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeInTheDocument();
          const modalBody = screen.getByText(modalOptions.withBody.body);
          expect(modalBody).toBeInTheDocument();
        });
        testModalOpenAndHandleClose();
      });
      describe('url modal', () => {
        beforeEach(() => {
          hooks.useModalIFrameData.mockReturnValueOnce({ ...modalIFrameData, modalOptions: modalOptions.withUrl });
          render(<ContentIFrame {...props} />);
        });
        it('displays Modal with iframe to provided url if modal.body is not provided', () => {
          const iframe = screen.getByTitle(modalOptions.withUrl.title);
          expect(iframe).toBeInTheDocument();
          expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
          expect(iframe).toHaveAttribute('src', modalOptions.withUrl.url);
        });
        testModalOpenAndHandleClose();
      });
    });
  });
});
