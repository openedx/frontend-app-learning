import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';

import { initializeMockApp, initializeTestStore } from '@src/setupTest';
import SidebarContext from '../../../SidebarContext';
import SidebarUnit from './SidebarUnit';
import { ID } from '../constants';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
  sendTrackingLogEvent: jest.fn(),
}));

initializeMockApp();

describe('<SidebarUnit />', () => {
  let store = {};
  let unit;
  let sequenceId;
  let defaultSidebarContext;

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    [sequenceId] = Object.keys(state.courseware.courseOutline.sequences);
    const sequence = state.courseware.courseOutline.sequences[sequenceId];
    unit = state.courseware.courseOutline.units[sequence.unitIds[0]];

    defaultSidebarContext = {
      toggleSidebar: jest.fn(),
      currentSidebar: ID,
    };
  };

  function renderWithProvider(props = {}, sidebarContext = defaultSidebarContext, pathname = '/course') {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <IntlProvider locale="en">
          <SidebarContext.Provider value={{ ...sidebarContext }}>
            <MemoryRouter initialEntries={[{ pathname }]}>
              <SidebarUnit
                isFirst
                id={unit.id}
                courseId="course123"
                sequenceId={sequenceId}
                unit={{ ...unit, icon: 'video', isLocked: false }}
                isActive={false}
                activeUnitId={unit.id}
                isCompletionTrackingEnabled
                {...props}
              />
            </MemoryRouter>
          </SidebarContext.Provider>
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

  it('renders correctly when unit is complete and tracking enabled', async () => {
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

  describe('handleUnitClick coverage tests', () => {
    it('should handle click when activeUnitId is null/undefined (covers findSequenceByUnitId return null)', async () => {
      const user = userEvent.setup();
      await initTestStore();
      
      // Render with activeUnitId as null to trigger the findSequenceByUnitId return null
      renderWithProvider({ 
        activeUnitId: null,
        unit: { ...unit } 
      });

      // Click should not cause errors and should not send tracking events
      await user.click(screen.getByText(unit.title));

      // Since activeSequence will be null, tracking events should not be sent
      expect(sendTrackEvent).not.toHaveBeenCalled();
      expect(sendTrackingLogEvent).not.toHaveBeenCalled();
    });

    it('should handle click when activeUnitId is undefined (covers findSequenceByUnitId return null)', async () => {
      const user = userEvent.setup();
      await initTestStore();
      
      // Render with activeUnitId as undefined to trigger the findSequenceByUnitId return null
      renderWithProvider({ 
        activeUnitId: undefined,
        unit: { ...unit } 
      });

      await user.click(screen.getByText(unit.title));

      // Since activeSequence will be null, tracking events should not be sent
      expect(sendTrackEvent).not.toHaveBeenCalled();
      expect(sendTrackingLogEvent).not.toHaveBeenCalled();
    });

    it('should handle click when unit id is not found in any sequence (covers early return)', async () => {
      const user = userEvent.setup();
      await initTestStore();
      
      // Use a unit ID that doesn't exist in any sequence
      const nonExistentUnitId = 'non-existent-unit-id';
      
      renderWithProvider({ 
        unit: { ...unit, id: nonExistentUnitId },
        id: nonExistentUnitId,
        activeUnitId: unit.id // valid activeUnitId but invalid target unit
      });

      await user.click(screen.getByText(unit.title));

      // Since targetSequence will be null, tracking events should not be sent
      expect(sendTrackEvent).not.toHaveBeenCalled();
      expect(sendTrackingLogEvent).not.toHaveBeenCalled();
    });

    it('should handle click when both activeUnitId and target unit id are invalid', async () => {
      const user = userEvent.setup();
      await initTestStore();
      
      const nonExistentUnitId = 'non-existent-unit-id';
      const anotherNonExistentUnitId = 'another-non-existent-unit-id';
      
      renderWithProvider({ 
        unit: { ...unit, id: nonExistentUnitId },
        id: nonExistentUnitId,
        activeUnitId: anotherNonExistentUnitId
      });

      await user.click(screen.getByText(unit.title));

      // Both sequences will be null, so tracking events should not be sent
      expect(sendTrackEvent).not.toHaveBeenCalled();
      expect(sendTrackingLogEvent).not.toHaveBeenCalled();
    });
  });

  describe('When a unit is clicked', () => {
    it('sends log event correctly', async () => {
      const user = userEvent.setup();
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

      await user.click(screen.getByText(unit.title));

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', logData);
      expect(sendTrackingLogEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', logData);
    });

    it('leaves sidebar open in desktop mode', async () => {
      const user = userEvent.setup();
      await initTestStore();
      renderWithProvider({ unit: { ...unit } });
      await user.click(screen.getByText(unit.title));

      expect(defaultSidebarContext.toggleSidebar).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem('hideCourseOutlineSidebar')).toBeNull();
    });

    it('closes sidebar on mobile devices', async () => {
      const user = userEvent.setup();
      await initTestStore();
      renderWithProvider({ unit: { ...unit } }, { ...defaultSidebarContext, shouldDisplayFullScreen: true });
      await user.click(screen.getByText(unit.title));

      expect(defaultSidebarContext.toggleSidebar).toHaveBeenCalledTimes(1);
      expect(defaultSidebarContext.toggleSidebar).toHaveBeenCalledWith(null);
      expect(window.sessionStorage.getItem('hideCourseOutlineSidebar')).toEqual('true');
    });
  });

  describe('UnitLinkWrapper', () => {
    describe('course in preview mode', () => {
      beforeEach(async () => {
        await initTestStore();
        renderWithProvider({ unit: { ...unit } }, { ...defaultSidebarContext, shouldDisplayFullScreen: true }, '/preview/course');
      });

      it('href includes /preview', async () => {
        const unitLink = screen.getByText(unit.title).closest('a');
        const linkHref = unitLink.getAttribute('href');

        expect(linkHref.includes('/preview/')).toBeTruthy();
      });
    });

    describe('course in live mode', () => {
      beforeEach(async () => {
        await initTestStore();
        renderWithProvider({ unit: { ...unit } }, { ...defaultSidebarContext, shouldDisplayFullScreen: true });
      });

      it('href does not include /preview/', async () => {
        const unitLink = screen.getByText(unit.title).closest('a');
        const linkHref = unitLink.getAttribute('href');

        expect(linkHref.includes('/preview/')).toBeFalsy();
      });
    });
  });
});
