import React from 'react';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { initializeTestStore, render, screen } from '../setupTest';
import { TabContainer } from './index';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.mock('./TabPage', () => function () {
  return <div data-testid="TabPage" />;
});

describe('Tab Container', () => {
  let courseId;
  let mockFetch;
  let mockData;

  beforeEach(async () => {
    mockFetch = jest.fn().mockImplementation((x) => x);
    mockData = {
      fetch: mockFetch,
      tab: 'dummy',
      slice: 'courseware',
    };
    const store = await initializeTestStore({ excludeFetchSequence: true });
    courseId = store.getState().courseware.courseId;
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter initialEntries={[`/course/${courseId}`]}>
        <Routes>
          <Route
            path="/course/:courseId"
            element={(
              <TabContainer {...mockData}>
                children={[]}
              </TabContainer>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(courseId);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(courseId);
    expect(screen.getByTestId('TabPage')).toBeInTheDocument();
  });

  it('Should handle passing in a targetUserId', () => {
    const targetUserId = '1';

    render(
      <MemoryRouter initialEntries={[`/course/${courseId}/progress/${targetUserId}/`]}>
        <Routes>
          <Route
            path="/course/:courseId/progress/:targetUserId/"
            element={(
              <TabContainer
                fetch={mockFetch}
                tab="dummy"
                slice="courseHome"
                isProgressTab
              >
                children={[]}
              </TabContainer>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(courseId, targetUserId);
    expect(screen.getByTestId('TabPage')).toBeInTheDocument();
  });
});
