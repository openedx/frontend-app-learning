import React from 'react';
import { history } from '@edx/frontend-platform';
import { Route } from 'react-router';
import { initializeTestStore, render, screen } from '../setupTest';
import { TabContainer } from './index';

const mockDispatch = jest.fn();
const mockFetch = jest.fn().mockImplementation((x) => x);
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.mock('./TabPage', () => () => <div data-testid="TabPage" />);

describe('Tab Container', () => {
  const mockData = {
    children: [],
    fetch: mockFetch,
    tab: 'dummy',
    slice: 'courseware',
  };
  let courseId;

  beforeAll(async () => {
    const store = await initializeTestStore({ excludeFetchSequence: true });
    courseId = store.getState().courseware.courseId;
  });

  it('renders correctly', () => {
    history.push(`/course/${courseId}`);
    render(
      <Route path="/course/:courseId">
        <TabContainer {...mockData} />
      </Route>,
    );

    expect(mockFetch)
      .toHaveBeenCalledTimes(1)
      .toHaveBeenCalledWith(courseId);
    expect(mockDispatch)
      .toHaveBeenCalledTimes(1)
      .toHaveBeenCalledWith(courseId);
    expect(screen.getByTestId('TabPage')).toBeInTheDocument();
  });
});
