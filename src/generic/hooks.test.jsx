import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useScrollToContent, useEventListener, useIFrameHeight } from './hooks';

global.scrollTo = jest.fn();
global.console.warn = jest.fn();

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
  describe('useScrollToContent', () => {
    const TestComponent = () => {
      useScrollToContent();
      return (
        <>
          <a href="#main-content" data-testid="skip-link">Skip to content</a>
          <div id="main-content" tabIndex={-1} data-testid="target-content">Main Content</div>
        </>
      );
    };

    test('should scroll to target element and focus', async () => {
      render(<TestComponent />);

      const skipLink = screen.getByRole('link', { name: /skip to content/i });
      const targetContent = screen.getByTestId('target-content');

      targetContent.focus = jest.fn();

      userEvent.click(skipLink);

      await waitFor(() => {
        expect(global.scrollTo).toHaveBeenCalledWith({
          top: expect.any(Number), behavior: 'smooth',
        });
      });
      expect(targetContent.focus).toHaveBeenCalled();
    });

    test('should warn if element is not focusable', async () => {
      render(<TestComponent />);

      const skipLink = screen.getByTestId('skip-link');
      const targetContent = screen.getByTestId('target-content');

      Object.defineProperty(targetContent, 'focus', {
        value: undefined,
        configurable: true,
      });

      await userEvent.click(skipLink);

      await waitFor(() => {
        expect(global.scrollTo).toHaveBeenCalledWith({
          top: expect.any(Number),
          behavior: 'smooth',
        });
      });

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith('Element with ID "main-content" exists but is not focusable.');
    });

    test('should warn if target element is not found', async () => {
      const ComponentWithoutTarget = () => {
        useScrollToContent();
        return (
          <>
            <a href="#main-content" data-testid="skip-link">Skip to content</a>
            {/* Нет #main-content */}
          </>
        );
      };

      render(<ComponentWithoutTarget />);

      const skipLink = screen.getByRole('link', { name: /skip to content/i });

      await userEvent.click(skipLink);

      await waitFor(() => {
        // eslint-disable-next-line no-console
        expect(console.warn).toHaveBeenCalledWith('Element with ID "main-content" not found.');
      });
    });
  });
});
