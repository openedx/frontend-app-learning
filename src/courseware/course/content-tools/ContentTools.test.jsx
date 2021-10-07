import React from 'react';
import { initializeTestStore, render, screen } from '../../../setupTest';
import ContentTools from './ContentTools';

jest.mock('./calculator/Calculator', () => () => <div data-testid="Calculator" />);
jest.mock('./notes-visibility/NotesVisibility', () => () => <div data-testid="NotesVisibility" />);

describe('Content Tools', () => {
  const mockData = {
    course: {
      notes: { enabled: false },
      showCalculator: false,
    },
  };

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  it('hides content tools', () => {
    const { container } = render(<ContentTools {...mockData} />);
    expect(container.getElementsByClassName('d-flex')[0]).toBeEmptyDOMElement();
  });

  it('displays Calculator', () => {
    const testData = JSON.parse(JSON.stringify(mockData));
    testData.course.showCalculator = true;
    render(<ContentTools {...testData} />);

    expect(screen.getByTestId('Calculator')).toBeInTheDocument();
    expect(screen.queryByTestId('NotesVisibility')).not.toBeInTheDocument();
  });

  it('displays Notes Visibility', () => {
    const testData = JSON.parse(JSON.stringify(mockData));
    testData.course.notes.enabled = true;
    render(<ContentTools {...testData} />);

    expect(screen.getByTestId('NotesVisibility')).toBeInTheDocument();
    expect(screen.queryByTestId('Calculator')).not.toBeInTheDocument();
  });
});
