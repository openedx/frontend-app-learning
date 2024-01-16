import React from 'react';
import {
  initializeMockApp,
  render,
  screen,
} from '../../setupTest';
import CoursewareSearchEmpty from './CoursewareSearchEmpty';

function renderComponent() {
  const { container } = render(<CoursewareSearchEmpty />);
  return container;
}

describe('CoursewareSearchEmpty', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  it('should match the snapshot', () => {
    renderComponent();

    expect(screen.getByTestId('no-results')).toMatchSnapshot();
  });
});
