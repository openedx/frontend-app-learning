import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { datesTabDataQuery } from '@src/course-home/data/apiHooks';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import Timeline from './Timeline';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const dateBlock = (date, title) => ({
  assignmentType: null, complete: false, date, dateType: 'course-start-date', learnerHasAccess: true, link: '', title,
});

const renderDays = (courseDateBlocks) => {
  const queryClient = createTestQueryClient();
  seedQueryData(queryClient, datesTabDataQuery(courseId).queryKey, { courseDateBlocks });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/course/${courseId}/dates`]}>
        <Routes>
          <Route path="/course/:courseId/dates" element={<Timeline />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return screen.getAllByRole('listitem');
};

describe('Timeline', () => {
  it('lists a date that falls today under today', () => {
    const days = renderDays([dateBlock('2020-01-01T12:00:00Z', 'Course starts'), dateBlock(new Date().toISOString(), 'Due today')]);

    expect(days).toHaveLength(2);
    expect(days[1]).toHaveTextContent('Today');
    expect(days[1]).toHaveTextContent('Due today');
  });

  it('ends with an empty today when every date has passed', () => {
    const days = renderDays([dateBlock('2020-01-01T12:00:00Z', 'Course starts')]);

    expect(days).toHaveLength(2);
    expect(days[1]).toHaveTextContent('Today');
    expect(days[1]).not.toHaveTextContent('Course starts');
  });
});
