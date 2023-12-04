import { camelCaseObject } from '@edx/frontend-platform';
import mapSearchResponse from './map-search-response';
import mockedResponse from './test-data/mocked-response.json';

describe('mapSearchResponse', () => {
  describe('when the response is correct', () => {
    let response;

    beforeEach(() => {
      response = mapSearchResponse(camelCaseObject(mockedResponse));
    });

    it('should match snapshot', () => {
      expect(response).toMatchSnapshot();
    });

    it('should match expected filters', () => {
      const expectedFilters = [
        { key: 'capa', label: 'CAPA', count: 7 },
        { key: 'sequence', label: 'Sequence', count: 2 },
        { key: 'text', label: 'Text', count: 9 },
        { key: 'unknown', label: 'Unknown', count: 1 },
        { key: 'video', label: 'Video', count: 2 },
      ];
      expect(response.filters).toEqual(expectedFilters);
    });
  });

  describe('when the a keyword is provided', () => {
    const searchText = 'Course';

    it('should not count matches title', () => {
      const response = mapSearchResponse(camelCaseObject(mockedResponse), searchText);
      expect(response.results[0].contentHits).toBe(0);
    });

    it('should count matches on content', () => {
      const response = mapSearchResponse(camelCaseObject(mockedResponse), searchText);
      expect(response.results[1].contentHits).toBe(1);
    });

    it('should ignore capitalization', () => {
      const response = mapSearchResponse(camelCaseObject(mockedResponse), searchText.toUpperCase());
      expect(response.results[1].contentHits).toBe(1);
    });
  });

  describe('when the response has a wrong format', () => {
    it('should throw an error', () => {
      expect(() => mapSearchResponse({ foo: 'bar' })).toThrow();
    });
  });
});
