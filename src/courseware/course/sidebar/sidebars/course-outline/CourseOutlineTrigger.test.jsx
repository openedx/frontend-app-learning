import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { breakpoints } from '@openedx/paragon';

import { mockCourseRequests } from '@src/tests/courseware';
import { render } from '@src/tests/render';
import SidebarState from '@src/tests/SidebarState';
import { SidebarProvider } from '../../SidebarContext';
import CourseOutlineTrigger from './CourseOutlineTrigger';
import { ID as outlineSidebarId } from './constants';
import messages from './messages';

describe('<CourseOutlineTrigger />', () => {
  let courseId;
  let unitId;

  const { innerWidth: originalInnerWidth } = window;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const initTestStore = (options) => {
    ({ courseId, unitId } = mockCourseRequests(options));
  };

  const toggleButton = () => screen.queryByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage });
  const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

  function renderWithProvider(props = {}) {
    const { container } = render(
      <SidebarProvider courseId={courseId} unitId={unitId} widgets={[]}>
        <CourseOutlineTrigger {...props} />
        <SidebarState />
      </SidebarProvider>,
      { wrapWithRouter: true, courseParams: { courseId, unitId } },
    );
    return container;
  }

  it('renders correctly for desktop when sidebar is enabled', async () => {
    const user = userEvent.setup();
    // A desktop viewport with the sidebar closed by the user: the outline is not open, so the
    // trigger shows; clicking it opens the outline, which hides the trigger.
    window.innerWidth = breakpoints.extraExtraLarge.minWidth;
    window.sessionStorage.setItem('sidebarClosedByUser', 'true');
    initTestStore();
    renderWithProvider({ isMobileView: false });

    expect(toggleButton()).toBeInTheDocument();
    expect(currentSidebar()).toBe('null');

    await user.click(toggleButton());

    expect(currentSidebar()).toBe(outlineSidebarId);
    expect(toggleButton()).not.toBeInTheDocument();
  });

  it('renders correctly for mobile when sidebar is enabled', async () => {
    const user = userEvent.setup();
    initTestStore();
    renderWithProvider({ isMobileView: true });

    expect(toggleButton()).toBeInTheDocument();
    expect(currentSidebar()).toBe('null');

    await user.click(toggleButton());

    expect(currentSidebar()).toBe(outlineSidebarId);
  });

  it('renders nothing for the desktop trigger on a narrow viewport', () => {
    initTestStore();
    renderWithProvider();

    expect(toggleButton()).not.toBeInTheDocument();
  });

  it('changes current sidebar value on click', async () => {
    const user = userEvent.setup();
    initTestStore();
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify(outlineSidebarId));
    renderWithProvider({ isMobileView: true });

    expect(currentSidebar()).toBe(outlineSidebarId);

    await user.click(toggleButton());

    expect(currentSidebar()).toBe('null');
  });
});
