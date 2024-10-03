import { getConfig } from '@edx/frontend-platform';
import { stringifyUrl } from 'query-string';
import { getIFrameUrl, iframeParams } from './urls';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));
jest.mock('query-string', () => ({
  stringifyUrl: jest.fn((arg) => ({ stringifyUrl: arg })),
}));

const config = { LMS_BASE_URL: 'test-lms-url' };
getConfig.mockReturnValue(config);

const props = {
  id: 'test-id',
  view: 'test-view',
  format: 'test-format',
  examAccess: { blockAccess: false, accessToken: 'test-access-token' },
};

describe('urls module getIFrameUrl', () => {
  test('format provided, exam access and token available', () => {
    const url = stringifyUrl({
      url: `${config.LMS_BASE_URL}/xblock/${props.id}`,
      query: {
        ...iframeParams,
        view: props.view,
        format: props.format,
        exam_access: props.examAccess.accessToken,
      },
    });
    expect(getIFrameUrl(props)).toEqual(url);
  });
  test('no format provided, exam access blocked', () => {
    const url = stringifyUrl({
      url: `${config.LMS_BASE_URL}/xblock/${props.id}`,
      query: { ...iframeParams, view: props.view },
    });
    expect(getIFrameUrl({
      id: props.id,
      view: props.view,
      examAccess: { blockAccess: true },
    })).toEqual(url);
  });
  test('jumpToId and fragmentIdentifier is added to url', () => {
    const url = stringifyUrl({
      url: `${config.LMS_BASE_URL}/xblock/${props.id}`,
      query: {
        ...iframeParams,
        view: props.view,
        format: props.format,
        exam_access: props.examAccess.accessToken,
        jumpToId: 'some-xblock-id',
      },
      fragmentIdentifier: 'some-xblock-id',
    });
    expect(getIFrameUrl({
      ...props,
      jumpToId: 'some-xblock-id',
    })).toEqual(url);
  });
});
