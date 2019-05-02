import { call, put, takeEvery } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import LoggingService from '@edx/frontend-logging';

// Actions
import {
  FETCH_LEARNING_SEQUENCE,
  fetchLearningSequenceBegin,
  fetchLearningSequenceSuccess,
  fetchLearningSequenceReset,
} from './actions';

// Services
import * as LmsApiService from './service';


export function* handleFetchLearningSequence(action) {
  try {
    yield put(fetchLearningSequenceBegin());
    const result = yield call(LmsApiService.getLearningSequence);
    yield put(fetchLearningSequenceSuccess(result));
    yield put(fetchLearningSequenceReset());
  } catch (e) {
    LoggingService.logAPIErrorResponse(e);
    yield put(push('/error'));
  }
}


export default function* learningSequenceSaga() {
  yield takeEvery(FETCH_LEARNING_SEQUENCE.BASE, handleFetchLearningSequence);
}
