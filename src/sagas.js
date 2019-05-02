import { all } from 'redux-saga/effects';
import { saga as learningSequenceSaga } from './learning-sequence';

export default function* rootSaga() {
  yield all([
    learningSequenceSaga(),
  ]);
}
