export const storeName = 'learningSequence';

// Pass everything in state as props for now
export const pageSelector = state => ({
  ...state[storeName],
  username: state.userAccount.username,
});
