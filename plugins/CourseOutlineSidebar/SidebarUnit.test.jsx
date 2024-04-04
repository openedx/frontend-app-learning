import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SidebarUnit from './SidebarUnit';
import { ID } from './constants';
import { initOutlineSidebarTestStore } from './utils';

describe('<SidebarUnit />', () => {
  let store = {};
  let unit;
  let sequenceId;

  const initTestStore = async (options) => {
    store = await initOutlineSidebarTestStore(options);
    const state = store.getState();
    [sequenceId] = Object.keys(state.plugins[ID].structure.sequences);
    const sequence = state.plugins[ID].structure.sequences[sequenceId];
    unit = state.plugins[ID].structure.units[sequence.unitIds[0]];
  };

  function renderWithProvider(props = {}) {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <IntlProvider locale="en">
          <MemoryRouter>
            <SidebarUnit
              isFirst
              id="unit1"
              courseId="course123"
              sequenceId={sequenceId}
              activeUnitId={unit.id}
              unit={{ ...unit, icon: 'video' }}
              isLocked={false}
              isActive={false}
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
      isLocked: true,
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
  });
});
