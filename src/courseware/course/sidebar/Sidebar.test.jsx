import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import AuxiliarySidebarSlot from '@src/slots/AuxiliarySidebarSlot';
import AuxiliarySidebarTriggerSlot from '@src/slots/AuxiliarySidebarTriggerSlot';
import { addSidebarWidgets } from '@src/tests/auxiliarySidebar';
import { render } from '@src/tests/render';
import SidebarTriggerBase from './common/TriggerBase';
import { SidebarProvider } from './SidebarContext';

const courseId = 'course-v1:edX+Test+2024';
const unitId = 'unit-1';

const stubWidget = (id) => ({
  id,
  Panel: () => <div data-testid={`${id.toLowerCase()}-panel`}>{id} Content</div>,
  Trigger: () => (
    <SidebarTriggerBase sidebarId={id} ariaLabel={`Open ${id}`}>
      <span>{id}</span>
    </SidebarTriggerBase>
  ),
  isAvailable: () => true,
});

const widgets = [stubWidget('DISCUSSIONS'), stubWidget('NOTES')];

// The panel a widget renders is chosen by the provider's current sidebar; the tests drive it the
// way a learner does, through a stored preference or the triggers.
function renderSidebar() {
  addSidebarWidgets(widgets);
  return render(
    <SidebarProvider courseId={courseId} unitId={unitId}>
      <AuxiliarySidebarTriggerSlot courseId={courseId} sequenceId="sequence-1" unitId={unitId} />
      <AuxiliarySidebarSlot courseId={courseId} sequenceId="sequence-1" unitId={unitId} />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );
}

describe('Sidebar', () => {
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
