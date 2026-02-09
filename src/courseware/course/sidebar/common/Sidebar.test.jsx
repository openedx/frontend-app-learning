import { Factory } from 'rosie';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import {
  initializeTestStore,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@src/setupTest';
import messages from '@src/courseware/course/messages';
import SidebarContext from '../SidebarContext';
import SidebarBase from './SidebarBase';
import { useSidebarFocusAndKeyboard } from './hooks/useSidebarFocusAndKeyboard';

jest.mock('./hooks/useSidebarFocusAndKeyboard');

const SIDEBAR_ID = 'test-sidebar';

const mockUseSidebarFocusAndKeyboard = useSidebarFocusAndKeyboard;

describe('SidebarBase', () => {
  let mockContextValue;
  const courseMetadata = Factory.build('courseMetadata');
  const user = userEvent.setup();

  let mockCloseBtnRef;
  let mockBackBtnRef;
  let mockHandleClose;
  let mockHandleKeyDown;
  let mockHandleBackBtnKeyDown;

  const defaultComponentProps = {
    title: 'Test Sidebar Title',
    ariaLabel: 'Test Sidebar Aria Label',
    sidebarId: SIDEBAR_ID,
    className: 'test-class',
    children: <div>Sidebar Content</div>,
  };

  const renderSidebar = (contextProps = {}, componentProps = {}) => {
    const fullContextValue = { ...mockContextValue, ...contextProps };
    const defaultProps = { ...defaultComponentProps, ...componentProps };
    return render(
      <SidebarContext.Provider value={fullContextValue}>
        <SidebarBase {...defaultProps} />
      </SidebarContext.Provider>,
    );
  };

  beforeEach(async () => {
    await initializeTestStore({
      courseMetadata,
      excludeFetchCourse: true,
      excludeFetchSequence: true,
    });

    mockContextValue = {
      courseId: courseMetadata.id,
      toggleSidebar: jest.fn(),
      shouldDisplayFullScreen: false,
      currentSidebar: null,
    };

    mockCloseBtnRef = createRef();
    mockBackBtnRef = createRef();
    mockHandleClose = jest.fn();
    mockHandleKeyDown = jest.fn();
    mockHandleBackBtnKeyDown = jest.fn();

    mockUseSidebarFocusAndKeyboard.mockReturnValue({
      closeBtnRef: mockCloseBtnRef,
      backBtnRef: mockBackBtnRef,
      handleClose: mockHandleClose,
      handleKeyDown: mockHandleKeyDown,
      handleBackBtnKeyDown: mockHandleBackBtnKeyDown,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render children, title, and close button when visible', () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID });
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText(defaultComponentProps.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage })).toBeInTheDocument();
    expect(screen.getByTestId(`sidebar-${SIDEBAR_ID}`)).toBeInTheDocument();
    expect(screen.getByTestId(`sidebar-${SIDEBAR_ID}`)).not.toHaveClass('d-none');
  });

  it('should be hidden via CSS class when not the current sidebar', () => {
    renderSidebar({ currentSidebar: 'another-sidebar-id' });
    const sidebarElement = screen.queryByTestId(`sidebar-${SIDEBAR_ID}`);
    expect(sidebarElement).toBeInTheDocument();
    expect(sidebarElement).toHaveClass('d-none');
  });

  it('should hide title bar when showTitleBar prop is false', () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID }, { showTitleBar: false });
    expect(screen.queryByText(defaultComponentProps.title)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.closeNotificationTrigger.defaultMessage })).not.toBeInTheDocument();
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('should render back button instead of close button in fullscreen', () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID, shouldDisplayFullScreen: true });
    expect(screen.getByRole('button', { name: messages.responsiveCloseNotificationTray.defaultMessage })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.closeNotificationTrigger.defaultMessage })).not.toBeInTheDocument();
  });

  it('should call handleClose from hook on close button click', async () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID });
    const closeButton = screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage });
    await user.click(closeButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should call handleClose from hook on fullscreen back button click', async () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID, shouldDisplayFullScreen: true });
    const backButton = screen.getByRole('button', { name: messages.responsiveCloseNotificationTray.defaultMessage });
    await user.click(backButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should call handleKeyDown from hook on standard close button keydown', () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID });
    const closeButton = screen.getByRole('button', { name: messages.closeNotificationTrigger.defaultMessage });
    fireEvent.keyDown(closeButton, { key: 'Tab' });
    expect(mockHandleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should call handleBackBtnKeyDown from hook on fullscreen back button keydown', () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID, shouldDisplayFullScreen: true });
    const backButton = screen.getByRole('button', { name: messages.responsiveCloseNotificationTray.defaultMessage });
    fireEvent.keyDown(backButton, { key: 'Enter' });
    expect(mockHandleBackBtnKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should call toggleSidebar(null) upon receiving a "close" postMessage event', async () => {
    renderSidebar({ currentSidebar: SIDEBAR_ID });

    fireEvent(window, new MessageEvent('message', {
      data: { type: 'learning.events.sidebar.close' },
    }));

    await waitFor(() => {
      expect(mockContextValue.toggleSidebar).toHaveBeenCalledTimes(1);
      expect(mockContextValue.toggleSidebar).toHaveBeenCalledWith(null);
    });
  });
});
