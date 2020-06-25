import axios from 'axios'; // eslint-disable-line import/no-extraneous-dependencies
import { configureStore } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';

import {
  getAuthenticatedHttpClient,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { reducer as coursewareReducer } from '../../../../data/slice';
import { reducer as modelsReducer } from '../../../../model-store';

import * as thunks from './thunks';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
getAuthenticatedUser.mockReturnValue({ username: 'edx' });

const executeThunk = async (thunk, dispatch, getState) => {
  await thunk(dispatch, getState);
  await new Promise(setImmediate);
};

describe('Data layer integration tests', () => {
  let store;

  beforeEach(() => {
    axiosMock.reset();
    logError.mockReset();

    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
      },
    });
  });

  const unitId = 'unitId';

  describe('Test addBookmark', () => {
    const createBookmarkURL = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;

    it('should fail to create bookmark in case of error', async () => {
      axiosMock.onPost(createBookmarkURL).networkError();

      await executeThunk(thunks.addBookmark(unitId), store.dispatch);

      expect(logError).toHaveBeenCalled();
      expect(axiosMock.history.post[0].url).toEqual(createBookmarkURL);
      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: false,
        bookmarkedUpdateState: 'failed',
      }));
    });

    it('should create bookmark and update model state', async () => {
      axiosMock.onPost(createBookmarkURL).reply(200);

      await executeThunk(thunks.addBookmark(unitId), store.dispatch);

      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: true,
        bookmarkedUpdateState: 'loaded',
      }));
    });
  });

  describe('Test removeBookmark', () => {
    const deleteBookmarkURL = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/edx,${unitId}/`;

    it('should fail to remove bookmark in case of error', async () => {
      axiosMock.onDelete(deleteBookmarkURL).networkError();

      await executeThunk(thunks.removeBookmark(unitId), store.dispatch);

      expect(logError).toHaveBeenCalled();
      expect(axiosMock.history.delete[0].url).toEqual(deleteBookmarkURL);
      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: true,
        bookmarkedUpdateState: 'failed',
      }));
    });

    it('should delete bookmark and update model state', async () => {
      axiosMock.onDelete(deleteBookmarkURL).reply(201);

      await executeThunk(thunks.removeBookmark(unitId), store.dispatch);

      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: false,
        bookmarkedUpdateState: 'loaded',
      }));
    });
  });
});
