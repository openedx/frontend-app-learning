import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import userEvent from '@testing-library/user-event';

import messages from '@src/courseware/course/messages';
import {
  fireEvent, initializeTestStore, render, screen,
} from '../../../../../setupTest';
import SidebarContext from '../../SidebarContext';
import NotificationTrigger, { ID } from './NotificationTrigger';

describe('Notification Trigger', () => {
  let mockData;
  let getItemSpy;
  let setItemSpy;
  const courseMetadata = Factory.build('courseMetadata');

  beforeEach(async () => {
    await initializeTestStore({
      courseMetadata,
      excludeFetchCourse: true,
      excludeFetchSequence: true,
    });
    mockData = {
      courseId: courseMetadata.id,
      sectionId: courseMetadata.sectionId,
      notificationStatus: 'inactive',
      setNotificationStatus: () => {},
      upgradeNotificationCurrentState: 'FPDdaysLeft',
      toggleSidebar: jest.fn(),
      currentSidebar: null,
    };
    // Jest does not support calls to localStorage, spying on localStorage's prototype directly instead
    getItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    setItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
  });

  afterAll(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  const SidebarWrapper = ({ contextValue, onClick }) => (
    <SidebarContext.Provider value={contextValue}>
      <NotificationTrigger onClick={onClick} />
    </SidebarContext.Provider>
  );

  SidebarWrapper.propTypes = {
    contextValue: PropTypes.shape({}).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  function renderWithProvider(data, onClick = () => {
  }) {
    const { container } = render(<SidebarWrapper contextValue={{ ...mockData, ...data }} onClick={onClick} />);
    return container;
  }

  it('handles onClick event toggling the notification tray', async () => {
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockData,
      toggleNotificationTray,
    };
    renderWithProvider(testData, toggleNotificationTray);

    const notificationTrigger = screen.getByRole('button', {
      name: messages.openNotificationTrigger.defaultMessage,
    });
    expect(notificationTrigger).toBeInTheDocument();
    fireEvent.click(notificationTrigger);
    expect(toggleNotificationTray).toHaveBeenCalledTimes(1);
  });

  it('renders notification trigger icon with red dot when notificationStatus is active', async () => {
    const container = renderWithProvider({ notificationStatus: 'active' });
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.getByTestId('notification-dot')).toBeInTheDocument();
  });

  it('renders notification trigger icon WITHOUT red dot within the same phase', async () => {
    const container = renderWithProvider({
      upgradeNotificationLastSeen: 'sameState',
      upgradeNotificationCurrentState: 'sameState',
    });
    expect(container)
      .toBeInTheDocument();
    expect(localStorage.getItem)
      .toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`);
    expect(localStorage.getItem(`upgradeNotificationLastSeen.${mockData.courseId}`))
      .toBe('"sameState"');
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon)
      .toHaveLength(1);
    expect(screen.queryByRole('notification-dot'))
      .not
      .toBeInTheDocument();
  });

  // Rendering NotificationTrigger has the effect of calling UpdateUpgradeNotificationLastSeen(),
  // if upgradeNotificationLastSeen is different than upgradeNotificationCurrentState
  // it should update localStorage accordingly
  it('makes the right updates when rendering a new phase from an UpgradeNotification change (before -> after)', async () => {
    const container = renderWithProvider({
      upgradeNotificationLastSeen: 'before',
      upgradeNotificationCurrentState: 'after',
    });
    expect(container).toBeInTheDocument();

    // verify localStorage get/set are called with correct arguments
    expect(localStorage.getItem).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`);
    expect(localStorage.setItem).toHaveBeenCalledWith(`notificationStatus.${mockData.courseId}`, '"active"');
    expect(localStorage.setItem).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`, '"after"');

    // verify localStorage is updated accordingly
    expect(localStorage.getItem(`upgradeNotificationLastSeen.${mockData.courseId}`)).toBe('"after"');
    expect(localStorage.getItem(`notificationStatus.${mockData.courseId}`)).toBe('"active"');
  });

  it('handles localStorage from a different course', async () => {
    const courseMetadataSecondCourse = Factory.build('courseMetadata', { id: 'second_id' });
    // set localStorage for a different course before rendering NotificationTrigger
    localStorage.setItem(`upgradeNotificationLastSeen.${courseMetadataSecondCourse.id}`, '"accessDateView"');
    localStorage.setItem(`notificationStatus.${courseMetadataSecondCourse.id}`, '"inactive"');

    const container = renderWithProvider({
      upgradeNotificationLastSeen: 'before',
      upgradeNotificationCurrentState: 'after',
    });
    expect(container).toBeInTheDocument();
    // Verify localStorage was updated for the original course
    expect(localStorage.getItem(`upgradeNotificationLastSeen.${mockData.courseId}`)).toBe('"after"');
    expect(localStorage.getItem(`notificationStatus.${mockData.courseId}`)).toBe('"active"');

    // Verify the second course localStorage was not changed
    expect(localStorage.getItem(`upgradeNotificationLastSeen.${courseMetadataSecondCourse.id}`)).toBe('"accessDateView"');
    expect(localStorage.getItem(`notificationStatus.${courseMetadataSecondCourse.id}`)).toBe('"inactive"');
  });

  it('should call toggleSidebar and onClick prop on click', async () => {
    const externalOnClick = jest.fn();
    renderWithProvider({}, externalOnClick);

    const triggerButton = screen.getByRole('button', {
      name: messages.openNotificationTrigger.defaultMessage,
    });
    await userEvent.click(triggerButton);

    expect(mockData.toggleSidebar).toHaveBeenCalledTimes(1);
    expect(mockData.toggleSidebar).toHaveBeenCalledWith(ID);

    expect(externalOnClick).toHaveBeenCalledTimes(1);
  });

  describe('when Tab key is pressed without Shift', () => {
    let triggerButton;
    let mockCloseButtonFocus;
    let mockCloseButton;
    let querySelectorSpy;

    beforeEach(() => {
      mockCloseButtonFocus = jest.fn();
      mockCloseButton = { focus: mockCloseButtonFocus };
      querySelectorSpy = jest.spyOn(document, 'querySelector').mockImplementation(selector => {
        if (selector === '.sidebar-close-btn') {
          return mockCloseButton;
        }
        return null;
      });
    });

    afterEach(() => {
      querySelectorSpy.mockRestore();
    });

    it('should focus the close button and prevent default behavior if sidebar is open', async () => {
      renderWithProvider({ currentSidebar: ID });
      triggerButton = screen.getByRole('button', {
        name: messages.openNotificationTrigger.defaultMessage,
      });

      triggerButton.focus();
      expect(document.activeElement).toBe(triggerButton);

      await userEvent.tab();

      expect(querySelectorSpy).toHaveBeenCalledWith('.sidebar-close-btn');
      expect(mockCloseButtonFocus).toHaveBeenCalledTimes(1);
    });

    it('should do nothing (allow default Tab behavior) if sidebar is closed', async () => {
      renderWithProvider({ currentSidebar: null });
      triggerButton = screen.getByRole('button', {
        name: messages.openNotificationTrigger.defaultMessage,
      });

      await userEvent.tab();

      expect(querySelectorSpy).not.toHaveBeenCalledWith('.sidebar-close-btn');
      expect(mockCloseButtonFocus).not.toHaveBeenCalled();
    });
  });

  it('should have aria-expanded="true" when sidebar is open', () => {
    renderWithProvider({ currentSidebar: ID });
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have aria-expanded="false" when sidebar is closed', () => {
    renderWithProvider({ currentSidebar: null });
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
  });
});
