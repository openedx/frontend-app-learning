import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';

import { initializeMockApp, initializeTestStore } from '@src/setupTest';
import SidebarUnit from './SidebarUnit';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
  sendTrackingLogEvent: jest.fn(),
}));

initializeMockApp();

describe('<SidebarUnit />', () => {
  let store = {};
  let unit;
  let sequenceId;

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    [sequenceId] = Object.keys(state.courseware.courseOutline.sequences);
    const sequence = state.courseware.courseOutline.sequences[sequenceId];
    unit = state.courseware.courseOutline.units[sequence.unitIds[0]];
  };

  function renderWithProvider(props = {}) {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <IntlProvider locale="en">
          <MemoryRouter>
            <SidebarUnit
              isFirst
              id={unit.id}
              courseId="course123"
              sequenceId={sequenceId}
              unit={{ ...unit, icon: 'video', isLocked: false }}
              isActive={false}
              activeUnitId={unit.id}
              {...props}
            />
          </MemoryRouter>
        </IntlProvider>
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly when unit is incomplete', async () => {
    await initTestStore();
    const container = renderWithProvider();

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is complete', async () => {
    await initTestStore();
    const container = renderWithProvider({ unit: { ...unit, complete: true } });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).toBeInTheDocument();
    expect(container.querySelector('.border-top')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is not first and icon is not set', async () => {
    await initTestStore();
    const container = renderWithProvider({
      isFirst: false,
      unit: { ...unit, icon: null },
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.border-top')).toBeInTheDocument();
  });

  it('renders correctly when unit is locked', async () => {
    await initTestStore();
    renderWithProvider({
      unit: { ...unit, isLocked: true },
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
  });

  it('sends log event correctly when unit is clicked', async () => {
    await initTestStore();
    renderWithProvider({ unit: { ...unit } });
    const logData = {
      id: unit.id,
      current_tab: 1,
      tab_count: 1,
      target_id: unit.id,
      target_tab: 1,
      widget_placement: 'left',
    };

    userEvent.click(screen.getByText(unit.title));

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', logData);
    expect(sendTrackingLogEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', logData);
  });
});
