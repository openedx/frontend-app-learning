import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { initializeTestStore } from '@src/setupTest';
import SidebarContext from '../../SidebarContext';
import { ID as discussionSidebarId } from '../discussions/DiscussionsTrigger';
import CourseOutlineTrigger from './CourseOutlineTrigger';
import { ID as outlineSidebarId } from './constants';
import messages from './messages';

describe('<CourseOutlineTrigger />', () => {
  let mockData;
  let courseId;
  let unitId;
  let store;

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    courseId = state.courseware.courseId;
    [unitId] = Object.keys(state.models.units);

    mockData = {
      courseId,
      unitId,
      currentSidebar: discussionSidebarId,
    };
  };

  function renderWithProvider(testData = {}, props = {}) {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <IntlProvider locale="en">
          <SidebarContext.Provider value={{ ...mockData, ...testData }}>
            <CourseOutlineTrigger {...props} />
          </SidebarContext.Provider>
        </IntlProvider>
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly for desktop when sidebar is enabled', async () => {
    const mockToggleSidebar = jest.fn();
    await initTestStore({ enableNavigationSidebar: { enable_navigation_sidebar: true } });
    renderWithProvider({ toggleSidebar: mockToggleSidebar }, { isMobileView: false });

    const toggleButton = await screen.getByRole('button', {
      name: messages.toggleCourseOutlineTrigger.defaultMessage,
    });
    expect(toggleButton).toBeInTheDocument();

    userEvent.click(toggleButton);

    expect(mockToggleSidebar).toHaveBeenCalled();
    expect(mockToggleSidebar).toHaveBeenCalledWith(outlineSidebarId);
  });

  it('renders correctly for mobile when sidebar is enabled', async () => {
    const mockToggleSidebar = jest.fn();
    await initTestStore({ enableNavigationSidebar: { enable_navigation_sidebar: true } });
    renderWithProvider({
      toggleSidebar: mockToggleSidebar,
      shouldDisplayFullScreen: true,
    }, { isMobileView: true });

    const toggleButton = await screen.getByRole('button', {
      name: messages.toggleCourseOutlineTrigger.defaultMessage,
    });
    expect(toggleButton).toBeInTheDocument();

    userEvent.click(toggleButton);

    expect(mockToggleSidebar).toHaveBeenCalled();
    expect(mockToggleSidebar).toHaveBeenCalledWith(outlineSidebarId);
  });

  it('changes current sidebar value on click', async () => {
    const mockToggleSidebar = jest.fn();
    await initTestStore({ enableNavigationSidebar: { enable_navigation_sidebar: true } });
    renderWithProvider({
      toggleSidebar: mockToggleSidebar,
      shouldDisplayFullScreen: true,
      currentSidebar: outlineSidebarId,
    }, { isMobileView: true });

    const toggleButton = await screen.getByRole('button', {
      name: messages.toggleCourseOutlineTrigger.defaultMessage,
    });
    expect(toggleButton).toBeInTheDocument();

    userEvent.click(toggleButton);

    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    expect(mockToggleSidebar).toHaveBeenCalledWith(null);
  });

  it('does not render when isEnabled is false', async () => {
    await initTestStore({ enableNavigationSidebar: { enable_navigation_sidebar: false } });
    renderWithProvider({}, { isMobileView: false });

    const toggleButton = await screen.queryByRole('button', {
      name: messages.toggleCourseOutlineTrigger.defaultMessage,
    });
    expect(toggleButton).not.toBeInTheDocument();
  });
});
