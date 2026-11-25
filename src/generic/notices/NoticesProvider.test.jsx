import React from 'react';
import { mergeAppConfig } from '@openedx/frontend-base';

import { act } from '@testing-library/react';

import { appId } from '@src/constants';
import { mockLocation } from '@src/tests/location';
import { render } from '@src/tests/render';
import NoticesProvider from './NoticesProvider';
import { getNotices } from './api';

jest.mock('./api', () => ({
  getNotices: jest.fn(),
}));

describe('NoticesProvider', () => {
  function buildAndRender() {
    render(
      <NoticesProvider>
        <div />
      </NoticesProvider>,
    );
  }

  afterEach(() => {
    act(() => mergeAppConfig(appId, { ENABLE_NOTICES: null }));
  });

  it('does not call api if ENABLE_NOTICES is false', () => {
    mergeAppConfig(appId, { ENABLE_NOTICES: false });
    buildAndRender();
    expect(getNotices).toHaveBeenCalledTimes(0);
  });

  it('redirects user on notice returned from API', async () => {
    const redirectUrl = 'http://example.com/test_route';
    mergeAppConfig(appId, { ENABLE_NOTICES: true });
    getNotices.mockImplementation(() => ({ results: [redirectUrl] }));
    mockLocation({ replace: jest.fn() });
    await act(async () => buildAndRender());
    expect(window.location.replace).toHaveBeenCalledWith(`${redirectUrl}?next=${window.location.href}`);
  });

  it('does not redirect on no data', async () => {
    getNotices.mockImplementation(() => ({}));
    mergeAppConfig(appId, { ENABLE_NOTICES: true });
    const { href } = mockLocation({ replace: jest.fn() });
    await act(async () => buildAndRender());
    expect(window.location.replace).toHaveBeenCalledTimes(0);
    expect(window.location.href).toBe(href);
  });
});
