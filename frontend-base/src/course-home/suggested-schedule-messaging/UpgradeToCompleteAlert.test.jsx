import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { datesTabDataQuery } from '@src/course-home/data/apiHooks';
import { mockLocation } from '@src/tests/location';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import UpgradeToCompleteAlert from './UpgradeToCompleteAlert';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const verifiedUpgradeLink = 'http://localhost:18130/basket/add/?sku=8CF08E5';

describe('UpgradeToCompleteAlert', () => {
  it('leaves for the upgrade link without a click handler supplied', () => {
    const location = mockLocation({ replace: jest.fn() });
    const queryClient = createTestQueryClient();
    seedQueryData(queryClient, datesTabDataQuery(courseId).queryKey, {
      datesBannerInfo: { contentTypeGatingEnabled: true, missedDeadlines: false, verifiedUpgradeLink },
      hasEnded: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/course/${courseId}/dates`]}>
          <Routes>
            <Route path="/course/:courseId/dates" element={<UpgradeToCompleteAlert />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade now' }));
    expect(location.replace).toHaveBeenCalledWith(verifiedUpgradeLink);
  });
});
