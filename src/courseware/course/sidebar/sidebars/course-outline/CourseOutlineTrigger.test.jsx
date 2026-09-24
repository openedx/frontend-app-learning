import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { breakpoints } from '@openedx/paragon';

import { createTestQueryClient, getTestStoreIds, initializeTestStore } from '@src/setupTest';
import SidebarState from '@src/tests/SidebarState';
import { SidebarProvider } from '../../SidebarContext';
import CourseOutlineTrigger from './CourseOutlineTrigger';
import { ID as outlineSidebarId } from './constants';
import messages from './messages';

describe('<CourseOutlineTrigger />', () => {
  let courseId;
  let unitId;
  let store;

  const { innerWidth: originalInnerWidth } = window;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    courseId = getTestStoreIds(store).courseId;
    [unitId] = Object.keys(state.models.units);
  };

  const toggleButton = () => screen.queryByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage });
  const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

  function renderWithProvider(props = {}) {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={createTestQueryClient(store)}>
          <IntlProvider locale="en">
            <MemoryRouter>
              <SidebarProvider courseId={courseId} unitId={unitId} widgets={[]}>
                <CourseOutlineTrigger {...props} />
                <SidebarState />
              </SidebarProvider>
            </MemoryRouter>
          </IntlProvider>
        </QueryClientProvider>
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly for desktop when sidebar is enabled', async () => {
    const user = userEvent.setup();
    // A desktop viewport with the sidebar closed by the user: the outline is not open, so the
    // trigger shows; clicking it opens the outline, which hides the trigger.
    window.innerWidth = breakpoints.extraExtraLarge.minWidth;
    window.sessionStorage.setItem('sidebarClosedByUser', 'true');
    await initTestStore();
    renderWithProvider({ isMobileView: false });

    expect(toggleButton()).toBeInTheDocument();
    expect(currentSidebar()).toBe('null');

    await user.click(toggleButton());

    expect(currentSidebar()).toBe(outlineSidebarId);
    expect(toggleButton()).not.toBeInTheDocument();
  });

  it('renders correctly for mobile when sidebar is enabled', async () => {
    const user = userEvent.setup();
    await initTestStore();
    renderWithProvider({ isMobileView: true });

    expect(toggleButton()).toBeInTheDocument();
    expect(currentSidebar()).toBe('null');

    await user.click(toggleButton());

    expect(currentSidebar()).toBe(outlineSidebarId);
  });

  it('changes current sidebar value on click', async () => {
    const user = userEvent.setup();
    await initTestStore();
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify(outlineSidebarId));
    renderWithProvider({ isMobileView: true });

    expect(currentSidebar()).toBe(outlineSidebarId);

    await user.click(toggleButton());

    expect(currentSidebar()).toBe('null');
  });
});
