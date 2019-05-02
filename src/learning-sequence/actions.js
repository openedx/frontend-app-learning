import { utils } from '../common';

const { AsyncActionType } = utils;

export const FETCH_LEARNING_SEQUENCE = new AsyncActionType('LEARN', 'FETCH_LEARNING_SEQUENCE');

// FETCH LEARNING SEQUENCE ACTIONS

export const fetchLearningSequence = () => ({
  type: FETCH_LEARNING_SEQUENCE.BASE,
  payload: {},
});

export const fetchLearningSequenceBegin = () => ({
  type: FETCH_LEARNING_SEQUENCE.BEGIN,
});

export const fetchLearningSequenceSuccess = result => ({
  type: FETCH_LEARNING_SEQUENCE.SUCCESS,
  payload: result,
});

export const fetchLearningSequenceReset = () => ({
  type: FETCH_LEARNING_SEQUENCE.RESET,
});
