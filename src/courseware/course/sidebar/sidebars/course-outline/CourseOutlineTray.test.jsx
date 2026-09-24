import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { createTestQueryClient, getTestStoreIds, initializeTestStore } from '@src/setupTest';
import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getCourseOutline } from '@src/courseware/data/api';
import SidebarContext from '../../SidebarContext';
import CourseOutlineTray from './CourseOutlineTray';
import { ID as outlineSidebarId } from './constants';
import messages from './messages';

describe('<CourseOutlineTray />', () => {
  let store;
  let section = {};
  let sequence = {};
  let unit;
  let unitId;
  let courseId;
  let activeSequenceId;
  let mockData;

  const { innerWidth: originalInnerWidth, innerHeight: originalInnerHeight } = window;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
  });

  const initTestData = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    ({ courseId, sequenceId: activeSequenceId } = getTestStoreIds(store));
    [unitId] = Object.keys(state.models.units);

    if (!options?.preventOutlineSidebarLoad) {
      const outline = await getCourseOutline(courseId);
      [activeSequenceId] = Object.keys(outline.sequences);
      sequence = outline.sequences[activeSequenceId];
      const activeSectionId = Object.keys(outline.sections)[0];
      section = outline.sections[activeSectionId];
      [unitId] = sequence.unitIds;
      unit = outline.units[unitId];
    }

    mockData = {
      courseId,
      unitId,
      currentSidebar: outlineSidebarId,
      toggleSidebar: jest.fn(),
    };
  };

  function renderWithProvider(testData = {}) {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={createTestQueryClient(store)}>
          <IntlProvider locale="en">
            <SidebarContext.Provider value={{ ...mockData, ...testData }}>
              <MemoryRouter initialEntries={[`/course/${courseId}/${activeSequenceId}/${unitId}`]}>
                <Routes>
                  <Route path="/course/:courseId/:sequenceId/:unitId" element={<CourseOutlineTray />} />
                </Routes>
              </MemoryRouter>
            </SidebarContext.Provider>
          </IntlProvider>
        </QueryClientProvider>
      </AppProvider>,
    );
    return container;
  }

  // Loaded = both queries resolved: the sequence row comes from the outline query and its
  // completion sr-only text from the toggles query (the spinner tracks only the outline).
  const waitForOutlineLoaded = () => screen.findByText(`, ${courseOutlineMessages.incompleteAssignment.defaultMessage}`);

  it('renders correctly when course outline is loading', async () => {
    await initTestData({ preventOutlineSidebarLoad: true });
    renderWithProvider();

    expect(await screen.findByText(messages.loading.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.courseOutlineTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Course outline' })).not.toBeInTheDocument();
  });

  it('renders correctly when course outline is loaded', async () => {
    await initTestData();
    renderWithProvider();
    await waitForOutlineLoaded();

    expect(screen.queryByText(messages.loading.defaultMessage)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: section.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(`${sequence.title} , ${courseOutlineMessages.incompleteAssignment.defaultMessage}`) })).toBeInTheDocument();
    expect(screen.getByText(unit.title)).toBeInTheDocument();
  });

  it('exposes aria-expanded=true on the in-tray toggle button', async () => {
    await initTestStore();
    renderWithProvider();

    const collapseBtn = screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');
    expect(collapseBtn).toHaveAttribute('aria-controls', 'outline-sidebar-outline');
  });

  it('collapses sidebar correctly when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const mockToggleSidebar = jest.fn();
    await initTestData();
    renderWithProvider({ toggleSidebar: mockToggleSidebar });
    await waitForOutlineLoaded();

    const collapseBtn = screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage });
    const sidebarBackBtn = screen.queryByRole('button', { name: section.title });
    expect(sidebarBackBtn).toBeInTheDocument();
    expect(collapseBtn).toBeInTheDocument();

    await user.click(collapseBtn);
    expect(mockToggleSidebar).toHaveBeenCalledWith(null);
  });

  it('collapses sidebar correctly when screen is resized', async () => {
    const mockToggleSidebar = jest.fn();
    await initTestData();
    renderWithProvider({ toggleSidebar: mockToggleSidebar });
    await waitForOutlineLoaded();

    const collapseBtn = screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage });
    expect(collapseBtn).toBeInTheDocument();

    // Simulate screen resize
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));

    expect(mockToggleSidebar).toHaveBeenCalledWith(null);
  });

  it('does not collapse sidebar when only the window height changes', async () => {
    const mockToggleSidebar = jest.fn();
    window.innerWidth = 500;
    window.innerHeight = 800;
    await initTestData();
    renderWithProvider({ toggleSidebar: mockToggleSidebar });
    await waitForOutlineLoaded();

    // Mobile browsers fire `resize` while scrolling, when the URL bar shows/hides. Only the
    // height changes, and the sidebar must stay open so its content remains scrollable.
    window.innerHeight = 650;
    window.dispatchEvent(new Event('resize'));

    expect(mockToggleSidebar).not.toHaveBeenCalled();
  });

  it('does not collapse sidebar when resized to a width that still displays it', async () => {
    const mockToggleSidebar = jest.fn();
    window.innerWidth = 1300;
    await initTestData();
    renderWithProvider({ toggleSidebar: mockToggleSidebar });
    await waitForOutlineLoaded();

    window.innerWidth = 1250;
    window.dispatchEvent(new Event('resize'));

    expect(mockToggleSidebar).not.toHaveBeenCalled();
  });

  it('tracks the last window width across resize events', async () => {
    const mockToggleSidebar = jest.fn();
    window.innerWidth = 1300;
    await initTestData();
    renderWithProvider({ toggleSidebar: mockToggleSidebar });
    await waitForOutlineLoaded();

    // A width change above the breakpoint is a no-op, but it updates the tracked width.
    window.innerWidth = 1250;
    window.dispatchEvent(new Event('resize'));
    expect(mockToggleSidebar).not.toHaveBeenCalled();

    // A subsequent resize below the breakpoint is still detected as a width change.
    window.innerWidth = 1100;
    window.dispatchEvent(new Event('resize'));
    expect(mockToggleSidebar).toHaveBeenCalledWith(null);

    // Repeating the same width does not trigger another collapse.
    mockToggleSidebar.mockClear();
    window.dispatchEvent(new Event('resize'));
    expect(mockToggleSidebar).not.toHaveBeenCalled();
  });

  it('navigates to section or sequence level correctly on click by back/section button', async () => {
    const user = userEvent.setup();
    await initTestData();
    renderWithProvider();
    await waitForOutlineLoaded();

    const sidebarBackBtn = screen.queryByRole('button', { name: section.title });
    expect(sidebarBackBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(`${sequence.title} , ${courseOutlineMessages.incompleteAssignment.defaultMessage}`) })).toBeInTheDocument();

    await user.click(sidebarBackBtn);
    expect(sidebarBackBtn).not.toBeInTheDocument();
    expect(screen.queryByText(messages.courseOutlineTitle.defaultMessage)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: new RegExp(`${section.title} , ${courseOutlineMessages.incompleteSection.defaultMessage}`) }));
    expect(screen.queryByRole('button', { name: section.title })).toBeInTheDocument();
  });
});
