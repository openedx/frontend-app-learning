import { getConfig } from '@edx/frontend-platform';
import { stringify } from 'query-string';
import { getIFrameUrl, iframeParams } from './urls';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));
jest.mock('query-string', () => ({
  stringify: jest.fn((...args) => ({ stringify: args })),
}));

const config = { LMS_BASE_URL: 'test-lms-url' };
getConfig.mockReturnValue(config);

const props = {
  id: 'test-id',
  view: 'test-view',
  format: 'test-format',
  examAccess: { blockAccess: false, accessToken: 'test-access-token' },
};

describe('urls module', () => {
  describe('getIFrameUrl', () => {
    test('format provided, exam access and token available', () => {
      const params = stringify({
        ...iframeParams,
        view: props.view,
        format: props.format,
        exam_access: props.examAccess.accessToken,
      });
      expect(getIFrameUrl(props)).toEqual(`${config.LMS_BASE_URL}/xblock/${props.id}?${params}`);
    });
    test('no format provided, exam access blocked', () => {
      const params = stringify({ ...iframeParams, view: props.view });
      expect(getIFrameUrl({
        id: props.id,
        view: props.view,
        examAccess: { blockAccess: true },
      })).toEqual(`${config.LMS_BASE_URL}/xblock/${props.id}?${params}`);
    });
  });
});
