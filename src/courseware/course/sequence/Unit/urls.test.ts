import { getConfig } from '@edx/frontend-platform';
import { getIFrameUrl } from './urls';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));
const config = { LMS_BASE_URL: 'https://test-lms-url' };
getConfig.mockReturnValue(config);

const props = {
  id: 'test-id',
  view: 'test-view',
  format: 'test-format',
  examAccess: { blockAccess: false, accessToken: 'test-access-token' },
  preview: false,
};

describe('urls module getIFrameUrl', () => {
  test('format provided, exam access and token available', () => {
    expect(getIFrameUrl(props)).toEqual('https://test-lms-url/xblock/test-id?exam_access=test-access-token&format=test-format&preview=false&recheck_access=1&show_bookmark=0&show_title=0&view=test-view');
  });
  test('no format provided, exam access blocked', () => {
    expect(getIFrameUrl({
      id: props.id,
      view: props.view,
      preview: props.preview,
      examAccess: { blockAccess: true },
    })).toEqual('https://test-lms-url/xblock/test-id?preview=false&recheck_access=1&show_bookmark=0&show_title=0&view=test-view');
  });
  test('jumpToId and fragmentIdentifier is added to url', () => {
    expect(getIFrameUrl({
      ...props,
      jumpToId: 'some-xblock-id',
    })).toEqual('https://test-lms-url/xblock/test-id?exam_access=test-access-token&format=test-format&jumpToId=some-xblock-id&preview=false&recheck_access=1&show_bookmark=0&show_title=0&view=test-view#some-xblock-id');
  });
  test('preview is true and url param equals 1', () => {
    expect(getIFrameUrl({
      ...props,
      preview: true,
    })).toEqual('https://test-lms-url/xblock/test-id?exam_access=test-access-token&format=test-format&preview=true&recheck_access=1&show_bookmark=0&show_title=0&view=test-view');
  });
});
