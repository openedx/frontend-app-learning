import { FETCH_LEARNING_SEQUENCE } from './actions';

export const initialState = {
  loading: false,
  loadingError: null,
  learningSequence: {},
};

const learningSequencePage = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LEARNING_SEQUENCE.BEGIN:
      return {
        ...state,
        loadingError: null,
        loading: true,
      };
    case FETCH_LEARNING_SEQUENCE.SUCCESS:
      return {
        ...state,
        learningSequence: action.payload.learningSequence,
        loading: false,
      };
    case FETCH_LEARNING_SEQUENCE.RESET:
      return {
        ...state,
        loadingError: null,
        loading: false,
      };
    default:
      return state;
  }
};

export default learningSequencePage;
