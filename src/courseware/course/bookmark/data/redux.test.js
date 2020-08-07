import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import executeThunk from '../../../../utils';
import initializeMockApp from '../../../../setupTest';
import initializeStore from '../../../../store';

import {
  addBookmark,
  removeBookmark,
  BOOKMARK_FAILED,
  BOOKMARK_LOADED,
} from './thunks';

const { loggingService } = initializeMockApp();

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('Data layer integration tests', () => {
  const unitId = 'unitId';

  let store;

  beforeEach(() => {
    axiosMock.reset();
    loggingService.logError.mockReset();

    store = initializeStore();
  });

  describe('Test addBookmark', () => {
    const createBookmarkURL = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;

    it('Should fail to create bookmark in case of error', async () => {
      axiosMock.onPost(createBookmarkURL).networkError();

      await executeThunk(addBookmark(unitId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(axiosMock.history.post[0].url).toEqual(createBookmarkURL);
      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: false,
        bookmarkedUpdateState: BOOKMARK_FAILED,
      }));
    });

    it('Should create bookmark and update model state', async () => {
      axiosMock.onPost(createBookmarkURL).reply(201);

      await executeThunk(addBookmark(unitId), store.dispatch);

      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: true,
        bookmarkedUpdateState: BOOKMARK_LOADED,
      }));
    });
  });

  describe('Test removeBookmark', () => {
    const deleteBookmarkURL = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/${getAuthenticatedUser().username},${unitId}/`;

    it('Should fail to remove bookmark in case of error', async () => {
      axiosMock.onDelete(deleteBookmarkURL).networkError();

      await executeThunk(removeBookmark(unitId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(axiosMock.history.delete[0].url).toEqual(deleteBookmarkURL);
      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: true,
        bookmarkedUpdateState: BOOKMARK_FAILED,
      }));
    });

    it('Should delete bookmark and update model state', async () => {
      axiosMock.onDelete(deleteBookmarkURL).reply(201);

      await executeThunk(removeBookmark(unitId), store.dispatch);

      expect(store.getState().models.units[unitId]).toEqual(expect.objectContaining({
        bookmarked: false,
        bookmarkedUpdateState: BOOKMARK_LOADED,
      }));
    });
  });
});
