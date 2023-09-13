import React from 'react';
import {
  render, screen, fireEvent, initializeMockApp,
} from '../../../../setupTest';
import ContentLock from './ContentLock';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Content Lock', () => {
  const mockData = {
    courseId: 'test-course-id',
    prereqSectionName: 'test-prerequisite-section-name',
    prereqId: 'test-prerequisite-id',
    sequenceTitle: 'test-sequence-title',
  };

  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });

  it('displays sequence title along with lock icon', () => {
    const { container } = render(<ContentLock {...mockData} />, { wrapWithRouter: true });

    const lockIcon = container.querySelector('svg');
    expect(lockIcon).toHaveClass('fa-lock');
    expect(lockIcon.parentElement).toHaveTextContent(mockData.sequenceTitle);
  });

  it('displays prerequisite name', () => {
    const prereqText = `You must complete the prerequisite: '${mockData.prereqSectionName}' to access this content.`;
    render(<ContentLock {...mockData} />, { wrapWithRouter: true });

    expect(screen.getByText(prereqText)).toBeInTheDocument();
  });

  it('handles click', () => {
    render(<ContentLock {...mockData} />, { wrapWithRouter: true });
    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith(`/course/${mockData.courseId}/${mockData.prereqId}`);
  });
});
