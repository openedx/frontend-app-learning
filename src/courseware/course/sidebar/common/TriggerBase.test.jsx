import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '@src/tests/render';
import SidebarState from '@src/tests/SidebarState';
import { SidebarProvider } from '../SidebarContext';
import SidebarTriggerBase from './TriggerBase';

describe('SidebarTriggerBase', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('renders a labelled button around its children that toggles its own panel', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider courseId="course-v1:edX+Test+2024" unitId="unit-1">
        <SidebarTriggerBase sidebarId="org.example.widget.panel" ariaLabel="Open the panel">
          <span>Icon</span>
        </SidebarTriggerBase>
        <SidebarState />
      </SidebarProvider>,
      { wrapWithRouter: true },
    );

    const button = screen.getByRole('button', { name: 'Open the panel' });
    expect(button).toHaveClass('sidebar-trigger-btn');
    expect(button).toHaveTextContent('Icon');

    await user.click(button);
    expect(screen.getByTestId('current-sidebar')).toHaveTextContent('org.example.widget.panel');

    await user.click(button);
    expect(screen.getByTestId('current-sidebar')).toHaveTextContent('null');
  });
});
