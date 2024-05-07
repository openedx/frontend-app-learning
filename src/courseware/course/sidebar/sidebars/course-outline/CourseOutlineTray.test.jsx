import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { initializeTestStore } from '@src/setupTest';
import courseOutlineMessages from '@src/course-home/outline-tab/messages';
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
  let mockData;

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    courseId = state.courseware.courseId;
    [unitId] = Object.keys(state.models.units);

    if (Object.keys(state.courseware.courseOutline).length) {
      const [activeSequenceId] = Object.keys(state.courseware.courseOutline.sequences);
      sequence = state.courseware.courseOutline.sequences[activeSequenceId];
      const activeSectionId = Object.keys(state.courseware.courseOutline.sections)[0];
      section = state.courseware.courseOutline.sections[activeSectionId];
      [unitId] = sequence.unitIds;
      unit = state.courseware.courseOutline.units[unitId];
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
        <IntlProvider locale="en">
          <SidebarContext.Provider value={{ ...mockData, ...testData }}>
            <MemoryRouter>
              <CourseOutlineTray />
            </MemoryRouter>
          </SidebarContext.Provider>
        </IntlProvider>
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly when course outline is loading', async () => {
    await initTestStore({ excludeFetchOutlineSidebar: true });
    renderWithProvider();

    expect(screen.getByText(messages.loading.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.courseOutlineTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Course Outline' })).not.toBeInTheDocument();
  });

  it('doesn\'t render when outline sidebar is disabled', async () => {
    await initTestStore({ enableNavigationSidebar: { enable_navigation_sidebar: false } });
    renderWithProvider();

    await expect(screen.queryByText(messages.loading.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: section.title })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders correctly when course outline is loaded', async () => {
    await initTestStore();
    renderWithProvider();

    await expect(screen.queryByText(messages.loading.defaultMessage)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: section.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${sequence.title} , ${courseOutlineMessages.incompleteAssignment.defaultMessage}` })).toBeInTheDocument();
    expect(screen.getByText(unit.title)).toBeInTheDocument();
  });

  it('collapses sidebar correctly when toggle button is clicked', async () => {
    const mockToggleSidebar = jest.fn();
    await initTestStore();
    renderWithProvider({ toggleSidebar: mockToggleSidebar });

    const collapseBtn = screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage });
    const sidebarBackBtn = screen.queryByRole('button', { name: section.title });
    expect(sidebarBackBtn).toBeInTheDocument();
    expect(collapseBtn).toBeInTheDocument();

    userEvent.click(collapseBtn);
    expect(mockToggleSidebar).toHaveBeenCalledWith(null);
  });

  it('navigates to section or sequence level correctly on click by back/section button', async () => {
    await initTestStore();
    renderWithProvider();

    const sidebarBackBtn = screen.queryByRole('button', { name: section.title });
    expect(sidebarBackBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${sequence.title} , ${courseOutlineMessages.incompleteAssignment.defaultMessage}` })).toBeInTheDocument();

    userEvent.click(sidebarBackBtn);
    expect(sidebarBackBtn).not.toBeInTheDocument();
    expect(screen.queryByText(messages.courseOutlineTitle.defaultMessage)).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: `${section.title} , ${courseOutlineMessages.incompleteSection.defaultMessage}` }));
    expect(screen.queryByRole('button', { name: section.title })).toBeInTheDocument();
  });
});
