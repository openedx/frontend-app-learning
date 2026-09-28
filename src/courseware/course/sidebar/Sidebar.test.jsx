import React from 'react';
import userEvent from '@testing-library/user-event';
import { initializeTestStore, render, screen } from '@src/setupTest';
import Sidebar from './Sidebar';
import { SidebarProvider } from './SidebarContext';
import SidebarTriggers from './SidebarTriggers';

const courseId = 'course-v1:edX+Test+2024';
const unitId = 'unit-1';

const stubWidget = (id) => ({
  id,
  priority: id === 'DISCUSSIONS' ? 10 : 20,
  Sidebar: () => <div data-testid={`${id.toLowerCase()}-panel`}>{id} Content</div>,
  // eslint-disable-next-line react/prop-types
  Trigger: ({ onClick }) => <button type="button" onClick={onClick}>{`Open ${id}`}</button>,
  isAvailable: () => true,
  enabled: true,
});

const widgets = [stubWidget('DISCUSSIONS'), stubWidget('NOTES')];

// The panel a widget renders is chosen by the provider's current sidebar; the tests drive it the
// way a learner does, through a stored preference or the triggers.
function renderSidebar() {
  return render(
    <SidebarProvider courseId={courseId} unitId={unitId} widgets={widgets}>
      <SidebarTriggers />
      <Sidebar />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );
}

describe('Sidebar', () => {
  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('renders no panel when nothing is open', () => {
    renderSidebar();

    expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('notes-panel')).not.toBeInTheDocument();
  });

  it('renders the stored panel', () => {
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('NOTES'));
    renderSidebar();

    expect(screen.getByTestId('notes-panel')).toHaveTextContent('NOTES Content');
    expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
  });

  it('renders no panel when the stored preference names a widget that is no longer registered', () => {
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('COURSE_OUTLINE'));
    const { container } = renderSidebar();

    expect(container.querySelector('[data-testid$="-panel"]')).not.toBeInTheDocument();
  });

  it('switches panels when another trigger is clicked', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('DISCUSSIONS'));
    renderSidebar();
    expect(screen.getByTestId('discussions-panel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open NOTES' }));

    expect(screen.getByTestId('notes-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
  });

  it('hides the panel when its own trigger is clicked again', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('DISCUSSIONS'));
    renderSidebar();
    expect(screen.getByTestId('discussions-panel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open DISCUSSIONS' }));

    expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
  });

  it('shows a panel when its trigger is clicked with nothing open', async () => {
    const user = userEvent.setup();
    renderSidebar();
    expect(screen.queryByTestId('notes-panel')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open NOTES' }));

    expect(screen.getByTestId('notes-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
  });
});
