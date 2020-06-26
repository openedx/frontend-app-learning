import axios from 'axios'; // eslint-disable-line import/no-extraneous-dependencies
import { configureStore } from '@reduxjs/toolkit';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import * as thunks from './thunks';

import executeThunk from '../../utils';

import { fetchSequence } from '../../data';
import { reducer as coursewareReducer } from '../../data/slice';
import { reducer as modelsReducer } from '../../model-store';

import '../../data/__factories__/sequenceMetadata.factory';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);


describe('Data layer integration tests', () => {
  let store;

  const courseId = 'courseId';
  const sequenceMetadata = Factory.build('sequenceMetadata');
  const sequenceId = sequenceMetadata.item_id;
  const sequenceUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;
  const unitId = sequenceMetadata.items[0].id;

  beforeEach(async () => {
    axiosMock.reset();
    logError.mockReset();

    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);

    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
      },
    });

    await executeThunk(fetchSequence(sequenceMetadata.item_id), store.dispatch);
  });

  describe('Test checkBlockCompletion', () => {
    const getCompletionURL = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/xmodule_handler/get_completion`;

    it('Should fail to check completion and log error', async () => {
      axiosMock.onPost(getCompletionURL).networkError();

      await executeThunk(
        thunks.checkBlockCompletion(courseId, sequenceId, unitId),
        store.dispatch,
        store.getState,
      );

      expect(logError).toHaveBeenCalled();
      expect(axiosMock.history.post[0].url).toEqual(getCompletionURL);
    });

    it('Should update complete field of unit model', async () => {
      axiosMock.onPost(getCompletionURL).reply(201, { complete: true });

      await executeThunk(
        thunks.checkBlockCompletion(courseId, sequenceId, unitId),
        store.dispatch,
        store.getState,
      );

      expect(store.getState().models.units[unitId].complete).toBeTruthy();
    });
  });

  describe('Test saveSequencePosition', () => {
    const gotoPositionURL = `${getConfig().LMS_BASE_URL}/courses/courseId/xblock/${sequenceId}/handler/xmodule_handler/goto_position`;

    it('Should change and revert sequence model position in case of error', async () => {
      axiosMock.onPost(gotoPositionURL).networkError();

      const newPosition = 123;

      await executeThunk(
        thunks.saveSequencePosition(courseId, sequenceId, newPosition),
        store.dispatch,
        store.getState,
      );

      expect(logError).toHaveBeenCalled();
      expect(axiosMock.history.post[0].url).toEqual(gotoPositionURL);
      expect(store.getState().models.sequences[sequenceId].position).toBeUndefined();
    });

    it('Should update sequence model position', async () => {
      axiosMock.onPost(gotoPositionURL).reply(201, {});

      const newPosition = 123;

      await executeThunk(
        thunks.saveSequencePosition(courseId, sequenceId, newPosition),
        store.dispatch,
        store.getState,
      );

      expect(axiosMock.history.post[0].url).toEqual(gotoPositionURL);
      expect(store.getState().models.sequences[sequenceId].position).toEqual(newPosition);
    });
  });
});
