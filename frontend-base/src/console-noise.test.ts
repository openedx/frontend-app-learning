// Throwaway: proves the setup file fails a test on unexpected console output.
describe('console noise', () => {
  it('fails when a test warns', () => {
    console.warn('unexpected');
  });
});

export {};
