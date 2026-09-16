import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import {
  createTestQueryClient, initializeMockApp, getTestStoreIds, initializeTestStore, seedQueryData,
} from '@src/setupTest';
import { getCourseOutline } from '@src/courseware/data/api';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import SidebarContext from '../../../SidebarContext';
import messages from '../messages';
import SidebarSequence from './SidebarSequence';

initializeMockApp();

describe('<SidebarSequence />', () => {
  let courseId;
  let store;
  let outline;
  let sequence;
  let unit;
  const sequenceDescription = 'sequence test description';
  let mockData;

  const initTestData = async (options) => {
    store = await initializeTestStore(options);
    courseId = getTestStoreIds(store).courseId;
    outline = await getCourseOutline(courseId);
    let activeSequenceId = '';
    [activeSequenceId] = Object.keys(outline.sequences);
    sequence = outline.sequences[activeSequenceId];
    const unitId = sequence.unitIds[0];
    unit = outline.units[unitId];

    mockData = {
      toggleSidebar: jest.fn(),
    };
  };

  function renderWithProvider(props = {}) {
    const queryClient = createTestQueryClient(store);
    seedQueryData(queryClient, coursewareQueryKeys.courseOutline(courseId), outline);
    seedQueryData(queryClient, coursewareQueryKeys.sidebarToggles(courseId), { enableCompletionTracking: true });
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale="en">
            <SidebarContext.Provider value={{ ...mockData }}>
              <MemoryRouter initialEntries={[`/course/${courseId}`]}>
                <Routes>
                  <Route
                    path="/course/:courseId"
                    element={(
                      <SidebarSequence
                        courseId={courseId}
                        defaultOpen={false}
                        sequence={sequence}
                        activeUnitId={sequence.unitIds[0]}
                        {...props}
                      />
                    )}
                  />
                </Routes>
              </MemoryRouter>
            </SidebarContext.Provider>
          </IntlProvider>
        </QueryClientProvider>
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly when sequence is collapsed and incomplete', async () => {
    await initTestData();
    renderWithProvider();

    expect(screen.getByText(sequence.title)).toBeInTheDocument();
    expect(screen.queryByText(sequenceDescription)).not.toBeInTheDocument();
    expect(screen.getByText(`, ${courseOutlineMessages.incompleteAssignment.defaultMessage}`)).toBeInTheDocument();
    expect(screen.queryByText(unit.title)).not.toBeInTheDocument();
  });

  it('renders correctly when sequence is not collapsed and complete and completion tracking enabled', async () => {
    const user = userEvent.setup();
    await initTestData();
    renderWithProvider({
      defaultOpen: true,
      sequence: {
        ...sequence,
        specialExamInfo: sequenceDescription,
        complete: true,
      },
    });

    expect(screen.getByText(sequence.title)).toBeInTheDocument();
    expect(screen.getByText(sequenceDescription)).toBeInTheDocument();
    expect(screen.getByText(`, ${courseOutlineMessages.completedAssignment.defaultMessage}`)).toBeInTheDocument();
    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(screen.getByText(`, ${messages.incompleteUnit.defaultMessage}`)).toBeInTheDocument();

    await user.click(screen.getByText(sequence.title));
    await waitFor(() => {
      expect(screen.queryByText(unit.title)).not.toBeInTheDocument();
      expect(screen.queryByText(`, ${messages.incompleteUnit.defaultMessage}`)).not.toBeInTheDocument();
    });
  });
});
