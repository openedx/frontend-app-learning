/* eslint react/prop-types: off */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import {
  getConfigSlots, organizePlugins, wrapComponent,
} from './utils';

import { PLUGIN_OPERATIONS } from './constants';

const mockModifyWidget = (widget) => {
  const newContent = {
    url: '/search',
    label: 'Search',
  };
  const modifiedWidget = widget;
  modifiedWidget.content = newContent;
  return modifiedWidget;
};

const mockIsAdminWrapper = ({ widget }) => {
  const isAdmin = true;
  return isAdmin ? widget : null;
};

const mockElementWrapper = ({ component, idx }) => (
  <div data-testid={`wrapper${idx + 1}`} key={idx}>
    This is a wrapper.
    {component}
  </div>
);

const mockRenderWidget = () => (
  <div data-testid="widget">
    This is a widget.
  </div>
);

const mockSlotChanges = [
  {
    op: PLUGIN_OPERATIONS.Wrap,
    widgetId: 'drafts',
    wrapper: mockIsAdminWrapper,
  },
  {
    op: PLUGIN_OPERATIONS.Hide,
    widgetId: 'home',
  },
  {
    op: PLUGIN_OPERATIONS.Modify,
    widgetId: 'lookUp',
    fn: mockModifyWidget,
  },
  {
    op: PLUGIN_OPERATIONS.Insert,
    widget: {
      id: 'login',
      priority: 50,
      content: {
        url: '/login', label: 'Login',
      },
    },
  },
];

const mockDefaultContent = [
  {
    id: 'home',
    priority: 5,
    content: { url: '/', label: 'Home' },
  },
  {
    id: 'lookUp',
    priority: 25,
    content: { url: '/lookup', label: 'Lookup' },
  },
  {
    id: 'drafts',
    priority: 35,
    content: { url: '/drafts', label: 'Drafts' },
  },
];

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    pluginSlots: {
      example_plugin_slot: {
        slotChanges: mockSlotChanges,
        defaultContent: mockDefaultContent,
      },
    },
  })),
}));

describe('organizePlugins', () => {
  describe('when there is no defaultContent', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return an empty array when there are no changes or additions to slot', () => {
      const plugins = organizePlugins([], []);
      expect(plugins.length).toBe(0);
      expect(plugins).toEqual([]);
    });

    it('should return an array of changes for non-default plugins', () => {
      const plugins = organizePlugins([], mockSlotChanges);
      expect(plugins.length).toEqual(1);
      expect(plugins[0].id).toEqual('login');
    });
  });

  describe('when there is defaultContent', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return an array of defaultContent if no changes for plugins in slot', () => {
      const plugins = organizePlugins(mockDefaultContent, []);
      expect(plugins.length).toEqual(3);
      expect(plugins).toEqual(mockDefaultContent);
    });

    it('should remove plugins with PluginOperation.Hide', () => {
      const plugins = organizePlugins(mockDefaultContent, mockSlotChanges);
      const widget = plugins.find((w) => w.id === 'home');
      expect(plugins.length).toEqual(4);
      expect(widget.hidden).toBe(true);
    });

    it('should modify plugins with PluginOperation.Modify', () => {
      const plugins = organizePlugins(mockDefaultContent, mockSlotChanges);
      const widget = plugins.find((w) => w.id === 'lookUp');

      expect(plugins.length).toEqual(4);
      expect(widget.content.url).toEqual('/search');
    });

    it('should wrap plugins with PluginOperation.Wrap', () => {
      const plugins = organizePlugins(mockDefaultContent, mockSlotChanges);
      const widget = plugins.find((w) => w.id === 'drafts');
      expect(plugins.length).toEqual(4);
      expect(widget.wrappers.length).toEqual(1);
    });

    it('should accept several wrappers for a single plugin with PluginOperation.Wrap', () => {
      const newMockWrapComponent = ({ widget }) => {
        const isStudent = false;
        return isStudent ? null : widget;
      };
      const newPluginChange = {
        op: PLUGIN_OPERATIONS.Wrap,
        widgetId: 'drafts',
        wrapper: newMockWrapComponent,
      };
      mockSlotChanges.push(newPluginChange);
      const plugins = organizePlugins(mockDefaultContent, mockSlotChanges);
      const widget = plugins.find((w) => w.id === 'drafts');
      expect(plugins.length).toEqual(4);
      expect(widget.wrappers.length).toEqual(2);
      expect(widget.wrappers[0]).toEqual(mockIsAdminWrapper);
      expect(widget.wrappers[1]).toEqual(newMockWrapComponent);
    });

    it('should return plugins arranged by priority', () => {
      const newPluginChange = {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'profile',
          priority: 1,
          content: {
            url: '/profile', label: 'Profile',
          },
        },
      };
      mockSlotChanges.push(newPluginChange);
      const plugins = organizePlugins(mockDefaultContent, mockSlotChanges);
      expect(plugins.length).toEqual(5);
      expect(plugins[0].id).toBe('profile');
      expect(plugins[1].id).toBe('home');
      expect(plugins[2].id).toBe('lookUp');
      expect(plugins[3].id).toBe('drafts');
      expect(plugins[4].id).toBe('login');
    });

    it('should raise an error for an operation that does not exist', async () => {
      const badPluginChange = {
        op: PLUGIN_OPERATIONS.Destroy,
        widgetId: 'drafts',
      };
      mockSlotChanges.push(badPluginChange);

      expect.assertions(1);
      try {
        await organizePlugins(mockDefaultContent, mockSlotChanges);
      } catch (error) {
        expect(error.message).toBe('unknown direct plugin change operation');
      }
    });
  });
});

describe('wrapComponent', () => {
  describe('when provided with a single wrapper in an array', () => {
    it('should wrap the provided component', () => {
      const wrappedComponent = wrapComponent(mockRenderWidget, [mockElementWrapper]);

      const { getByTestId } = render(wrappedComponent);

      const wrapper = getByTestId('wrapper1');
      const widget = getByTestId('widget');

      expect(wrapper).toContainElement(widget);
    });
  });
  describe('when provided with multiple wrappers in an array', () => {
    it('should wrap starting with the first wrapper in the array', () => {
      const wrappedComponent = wrapComponent(
        mockRenderWidget,
        [mockElementWrapper, mockElementWrapper, mockElementWrapper],
      );

      const { getByTestId } = render(wrappedComponent);

      const innermostWrapper = getByTestId('wrapper1');
      const middleWrapper = getByTestId('wrapper2');
      const outermostWrapper = getByTestId('wrapper3');
      const widget = getByTestId('widget');

      expect(innermostWrapper).toContainElement(widget);
      expect(middleWrapper).toContainElement(innermostWrapper);
      expect(outermostWrapper).toContainElement(middleWrapper);
    });
  });
});

describe('getConfigSlots', () => {
  it('returns the plugin slots from the Config Document', () => {
    const expected = {
      example_plugin_slot: {
        slotChanges: mockSlotChanges,
        defaultContent: mockDefaultContent,
      },
    };
    expect(getConfigSlots()).toStrictEqual(expected);
  });
});
