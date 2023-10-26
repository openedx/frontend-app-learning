import React from 'react';
import {
  initializeMockApp,
  render,
  screen,
  waitFor,
} from '../../setupTest';
import { CoursewareSearchResultsFilter, filteredResultsBySelection } from './CoursewareResultsFilter';

const mockResults = [
  { type: 'video', title: 'video_title' },
  { type: 'video', title: 'video_title2' },
  { type: 'document', title: 'document_title' },
  { type: 'text', title: 'text_title1' },
  { type: 'text', title: 'text_title2' },
  { type: 'text', title: 'text_title3' },
];

describe('CoursewareSearchResultsFilter', () => {
  beforeAll(initializeMockApp);

  describe('filteredResultsBySelection', () => {
    it('returns a no values array when no results are provided', () => {
      const results = filteredResultsBySelection({ results: [] });

      expect(results.length).toEqual(0);
    });

    it('returns all values when no key value is provided', () => {
      const results = filteredResultsBySelection({ results: mockResults });

      expect(results.length).toEqual(mockResults.length);
    });

    it('returns all values when the key value "all" is provided', () => {
      const results = filteredResultsBySelection({ filterKey: 'all', results: mockResults });

      expect(results.length).toEqual(mockResults.length);
    });

    it('returns only "video"-typed elements when the key value "video" is given', () => {
      const results = filteredResultsBySelection({ filterKey: 'video', results: mockResults });

      expect(results.length).toEqual(2);
    });

    it('returns only "course_outline"-typed elements when the key value "document" is given', () => {
      const results = filteredResultsBySelection({ filterKey: 'document', results: mockResults });

      expect(results.length).toEqual(1);
    });

    it('returns only "text"-typed elements when the key value "text" is given', () => {
      const results = filteredResultsBySelection({ filterKey: 'text', results: mockResults });

      expect(results.length).toEqual(3);
    });
  });

  describe('</CoursewareSearchResultsFilter />', () => {
    it('should render', async () => {
      await render(<CoursewareSearchResultsFilter results={mockResults} />);

      await waitFor(() => {
        expect(screen.queryByTestId('courseware-search-results-tabs')).toBeInTheDocument();
        expect(screen.queryByText(/All content/)).toBeInTheDocument();
        expect(screen.queryByText(/Course outline/)).toBeInTheDocument();
        expect(screen.queryByText(/Text/)).toBeInTheDocument();
        expect(screen.queryByText(/Video/)).toBeInTheDocument();
      });
    });

    it('should not render if no results are provided', async () => {
      await render(<CoursewareSearchResultsFilter results={[]} />);

      await waitFor(() => {
        expect(screen.queryByTestId('courseware-search-results-tabs')).not.toBeInTheDocument();
        expect(screen.queryByText(/All content/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Course outline/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Text/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Video/)).not.toBeInTheDocument();
      });
    });
  });
});
