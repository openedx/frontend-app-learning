import { initializeMockApp, render } from '../../../setupTest';
import Section from './Section';

const { loggingService } = initializeMockApp();

describe('Section', () => {
  it('throws when rendered without outline data', () => {
    // jsdom reports the caught render error on console.error; silence it, not the assertion.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Section
        defaultOpen
        expand={false}
        section={{
          complete: false,
          sequenceIds: ['sequence-1'],
          title: 'Introduction',
          hideFromTOC: false,
        }}
      />,
      { wrapWithRouter: true },
    );

    expect(loggingService.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Section "Introduction" rendered without outline data'),
      }),
      expect.anything(),
    );

    consoleError.mockRestore();
  });
});
