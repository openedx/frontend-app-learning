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
  PluginSlot: ({ id }: { id: string }) => (
    <div data-testid="plugin-slot" data-plugin-id={id}>
      id: {id}
    </div>
  ),
}));

describe('getPluginRoutes', () => {
  it('should return a valid route element for each plugin route', () => {
    const pluginRoutes = [
      {id: 'route-1', route: '/route-1'},
      {id: 'route-2', route: '/route-2'},
    ];
    (getConfig as jest.Mock).mockImplementation(() => ({
      PLUGIN_ROUTES: pluginRoutes,
    }));

    const { container } = render(getPluginRoutes());

    pluginRoutes.forEach(({id}) => {
      expect(container.querySelector(`[data-plugin-id="org.openedx.frontend.learning.course_page.${id}.v1"]`)).toBeInTheDocument();
    });
    expect(container.querySelectorAll('[data-testid="plugin-slot"]').length).toBe(pluginRoutes.length);
  });

  it('should return null if no plugin routes are configured', () => {
    (getConfig as jest.Mock).mockImplementation(() => ([]));

    const result = getPluginRoutes();
    expect(result).toBeNull();
  });
});
