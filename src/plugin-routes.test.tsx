import { getConfig } from '@edx/frontend-platform';
import { render } from '@testing-library/react';
import React from 'react';
import { getPluginRoutes } from './plugin-routes';

// Mock dependencies
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Route: ({ element }: { element: React.ReactNode }) => element,
}));

jest.mock('./decode-page-route', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: ({ id, pluginProps }: { id: string; pluginProps: Record<string, any> }) => (
    <div data-testid="plugin-slot" data-route={pluginProps.route}>
      id: {id}, route: {pluginProps.route}
    </div>
  ),
}));

describe('getPluginRoutes', () => {
  it('should return a valid route element for each plugin route', () => {
    const pluginRoutes = ['/route-1', '/route-2'];
    (getConfig as jest.Mock).mockImplementation(() => ({
      PLUGIN_ROUTES: pluginRoutes,
    }));

    const result = getPluginRoutes();
    const { container } = render(<>{result}</>);

    pluginRoutes.forEach((route) => {
      expect(container.querySelector(`[data-route="${route}"]`)).toBeInTheDocument();
    });
    expect(container.querySelectorAll('[data-testid="plugin-slot"]').length).toBe(pluginRoutes.length);
  });

  it('should return null if no plugin routes are configured', () => {
    (getConfig as jest.Mock).mockImplementation(() => ({}));

    const result = getPluginRoutes();
    expect(result).toBeNull();
  });
});
