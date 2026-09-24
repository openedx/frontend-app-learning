import { useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import {
  createTestQueryClient, getTestStoreIds, initializeTestStore, seedQueryData,
} from '@src/setupTest';
import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getCourseOutline } from '@src/courseware/data/api';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import { SidebarProvider } from '../../../SidebarContext';
import SidebarSection from './SidebarSection';

describe('<SidebarSection />', () => {
  let mockHandleSelectSection;
  let store;
  let courseId;
  let outline;
  let section;

  const initTestData = async (options) => {
    store = await initializeTestStore(options);
    courseId = getTestStoreIds(store).courseId;
    outline = await getCourseOutline(courseId);
    const [activeSectionId] = Object.keys(outline.sections);
    section = outline.sections[activeSectionId];
  };

  const RootWrapper = (props) => {
    const queryClient = useMemo(() => {
      const client = createTestQueryClient(store);
      seedQueryData(client, coursewareQueryKeys.courseOutline(courseId), outline);
      seedQueryData(client, coursewareQueryKeys.sidebarToggles(courseId), { enableCompletionTracking: true });
      return client;
    }, []);

    return (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale="en">
            <MemoryRouter initialEntries={[`/course/${courseId}`]}>
              <SidebarProvider courseId={courseId} unitId="unit-1" widgets={[]}>
                <Routes>
                  <Route
                    path="/course/:courseId"
                    element={(
                      <SidebarSection
                        section={section}
                        handleSelectSection={mockHandleSelectSection}
                        {...props}
                      />
                    )}
                  />
                </Routes>
              </SidebarProvider>
            </MemoryRouter>
          </IntlProvider>
        </QueryClientProvider>
      </AppProvider>
    );
  };

  beforeEach(() => {
    mockHandleSelectSection = jest.fn();
  });

  it('renders correctly when section is incomplete', async () => {
    const user = userEvent.setup();
    await initTestData();
    const { getByText, container } = render(<RootWrapper />);

    expect(getByText(section.title)).toBeInTheDocument();
    expect(getByText(`, ${courseOutlineMessages.incompleteSection.defaultMessage}`)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();

    const button = getByText(section.title);
    await user.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });

  it('renders correctly when section is complete', async () => {
    const user = userEvent.setup();
    await initTestData();
    const { getByText, getByTestId } = render(
      <RootWrapper section={{ ...section, completionStat: { completed: 4, total: 4 }, complete: true }} />,
    );

    expect(getByText(section.title)).toBeInTheDocument();
    expect(getByText(`, ${courseOutlineMessages.completedSection.defaultMessage}`)).toBeInTheDocument();
    expect(getByTestId('check-circle-icon')).toBeInTheDocument();

    const button = getByText(section.title);
    await user.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });
});
