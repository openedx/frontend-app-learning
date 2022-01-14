import React from 'react';
import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import {
  authenticatedUser, fireEvent, initializeMockApp, initializeTestStore, render, screen, waitFor,
} from '../../../../setupTest';
import HonorCode from './HonorCode';

initializeMockApp();
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  history: {
    push: jest.fn(),
  },
}));

describe('Honor Code', () => {
  let axiosMock;
  let store;
  let honorCodePostUrl;
  const mockData = {};

  async function setupStoreState(courseHomeMetaOptions) {
    if (courseHomeMetaOptions) {
      const courseHomeMetadata = Factory.build('courseHomeMetadata', courseHomeMetaOptions);
      store = await initializeTestStore({ courseHomeMetadata });
    } else {
      store = await initializeTestStore();
    }
    const storeState = store.getState();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    mockData.courseId = storeState.courseware.courseId;
    honorCodePostUrl = `${getConfig().LMS_BASE_URL}/api/agreements/v1/integrity_signature/${mockData.courseId}`;
  }

  it('cancel button links to course home ', async () => {
    await setupStoreState();
    render(<HonorCode {...mockData} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(history.push).toHaveBeenCalledWith(`/course/${mockData.courseId}/home`);
  });

  it('calls to save integrity_signature when agreeing', async () => {
    await setupStoreState({ username: authenticatedUser.username });
    render(<HonorCode {...mockData} />);
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(honorCodePostUrl);
    });
  });

  it('still calls to save integrity_signature if masquerading', async () => {
    await setupStoreState(
      {
        is_staff: false,
        original_user_is_staff: true,
        username: authenticatedUser.username,
      },
    );
    render(<HonorCode {...mockData} />);
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(honorCodePostUrl);
    });
  });

  it('will not call to save integrity_signature if masquerading a specific student', async () => {
    await setupStoreState(
      {
        is_staff: false,
        original_user_is_staff: true,
        username: 'otheruser',
      },
    );
    render(<HonorCode {...mockData} />);
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
  });

  afterEach(async () => {
    axiosMock.resetHistory();
  });
});
