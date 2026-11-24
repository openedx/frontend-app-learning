import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { createTestQueryClient, mockCourseRequests } from '@src/setupTest';
import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getCourseOutline } from '@src/courseware/data/api';
import { CourseOutline } from './CourseOutline';
import messages from './messages';

describe('<CourseOutline />', () => {
  let courseId;
  let sequenceId;
  let unitId;

  const initTestData = async () => {
    ({ courseId } = mockCourseRequests());
    const outline = await getCourseOutline(courseId);
    [sequenceId] = Object.keys(outline.sequences);
    [unitId] = outline.sequences[sequenceId].unitIds;
  };

  const renderOutline = ({ fullscreen = false } = {}) => {
    const onToggleCollapse = jest.fn();
    const onUnitClick = jest.fn();
    const { container } = render(
      <AppProvider wrapWithRouter={false}>
        <QueryClientProvider client={createTestQueryClient()}>
          <IntlProvider locale="en">
            <MemoryRouter initialEntries={[`/course/${courseId}/${sequenceId}/${unitId}`]}>
              <Routes>
                <Route
                  path="/course/:courseId/:sequenceId/:unitId"
                  element={(
                    <CourseOutline
                      fullscreen={fullscreen}
                      onToggleCollapse={onToggleCollapse}
                      onUnitClick={onUnitClick}
                    />
                  )}
                />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </QueryClientProvider>
      </AppProvider>,
    );
    return { container, onToggleCollapse, onUnitClick };
  };

  const waitForOutlineLoaded = () => screen.findByText(`, ${courseOutlineMessages.incompleteAssignment.defaultMessage}`);

  it('calls onToggleCollapse when the collapse button is clicked', async () => {
    const user = userEvent.setup();
    await initTestData();
    const { onToggleCollapse } = renderOutline();
    await waitForOutlineLoaded();

    await user.click(screen.getByRole('button', { name: messages.toggleCourseOutlineTrigger.defaultMessage }));

    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('renders full screen when fullscreen is true', async () => {
    await initTestData();
    const { container } = renderOutline({ fullscreen: true });
    await waitForOutlineLoaded();
    const sidebar = container.querySelector('.outline-sidebar-wrapper');
    expect(sidebar).toHaveClass('fixed-top');
    expect(sidebar).not.toHaveClass('flex-shrink-0');
  });

  it('renders inline when fullscreen is false', async () => {
    await initTestData();
    const { container } = renderOutline({ fullscreen: false });
    await waitForOutlineLoaded();
    const sidebar = container.querySelector('.outline-sidebar-wrapper');
    expect(sidebar).toHaveClass('flex-shrink-0');
    expect(sidebar).not.toHaveClass('fixed-top');
  });
});
