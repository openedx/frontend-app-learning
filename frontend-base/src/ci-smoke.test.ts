// Throwaway: proves the workflow runs the package's jest from frontend-base/.
describe('ci smoke', () => {
  it('runs from the frontend-base directory', () => {
    expect(process.cwd().endsWith('/frontend-base')).toBe(true);
  });
});

export {};
