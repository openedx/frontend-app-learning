import { render, screen, waitFor } from '@testing-library/react';
import { useEventListener, useIFrameHeight } from './hooks';

describe('Hooks', () => {
  test('useEventListener', async () => {
    const handler = jest.fn();
    const TestComponent = () => {
      useEventListener('message', handler);
      return (<div data-testid="testid" />);
    };
    render(<TestComponent />);

    await screen.findByTestId('testid');
    window.postMessage({ test: 'test' }, '*');
    await waitFor(() => expect(handler).toHaveBeenCalled());
  });
  test('useIFrameHeight', async () => {
    const onLoaded = jest.fn();
    const TestComponent = () => {
      const [hasLoaded, height] = useIFrameHeight(onLoaded);
      return (
        <div data-testid="testid">
          <span data-testid="loaded">
            {String(hasLoaded)}
          </span>
          <span data-testid="height">
            {String(height)}
          </span>
        </div>
      );
    };
    render(<TestComponent />);

    await screen.findByTestId('testid');
    expect(screen.getByTestId('loaded')).toHaveTextContent('false');
    expect(screen.getByTestId('height')).toHaveTextContent('null');
    window.postMessage({
      type: 'plugin.resize',
      payload: { height: 1234 },
    }, '*');
    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('loaded')).toHaveTextContent('true'));
    expect(screen.getByTestId('height')).toHaveTextContent('1234');
  });
});
