import { camelCaseObject } from '@edx/frontend-platform';
import mockedData from './mocked-response.json';
import mapSearchResponse from '../map-search-response';

function searchResultsFactory(searchKeywords = '', moreInfo = {}) {
  const data = camelCaseObject(mockedData);
  const info = mapSearchResponse(data, searchKeywords);

  const result = {
    ...info,
    ...moreInfo,
  };

  return result;
}

export default searchResultsFactory;
