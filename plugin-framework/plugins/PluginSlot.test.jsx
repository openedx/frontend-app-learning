/* eslint-disable react/prop-types */

import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import PluginSlot from './PluginSlot';
import { usePluginSlot } from './data/hooks';

const iframePluginConfig = {
  op: 'insert',
  widget: {
    id: 'iframe_config',
    url: 'http://localhost/plugin1',
    type: 'IFRAME_PLUGIN',
    title: 'test iframe plugin',
    priority: 1,
  },
};

const directHomeConfig = {
  id: 'home',
  type: 'DIRECT_PLUGIN',
  priority: 5,
  RenderWidget: ({ id, content }) => (
    <div data-testid={id}>
      {content.text}
    </div>
  ),
  content: { text: 'This is a widget.' },
};

const defaultSlotConfig = {
  plugins: [
    iframePluginConfig,
  ],
  defaultContents: [
    directHomeConfig,
  ],
};

jest.mock('./data/hooks', () => ({
  ...jest.requireActual('./data/hooks'),
  usePluginSlot: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }) => children,
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// Mock ResizeObserver which is unavailable in the context of a test.
global.ResizeObserver = jest.fn(function mockResizeObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

// TODO: APER-3119 — Write unit tests for plugin scenarios not already tested for https://2u-internal.atlassian.net/browse/APER-3119
const TestPluginSlot = (
  <IntlProvider locale="en">
    <PluginSlot
      id="test-slot"
      data-testid="test-slot-id"
    />
  </IntlProvider>
);

describe('PluginSlot', () => {
  beforeEach(() => {
    usePluginSlot.mockReturnValue(defaultSlotConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render multiple types of Plugin in a single slot config', () => {
    const { container, getByTestId } = render(TestPluginSlot);
    const iframeElement = container.querySelector('iframe');
    const directHomeElement = getByTestId(directHomeConfig.id);
    const pluginSlot = getByTestId('test-slot-id');

    expect(pluginSlot).toContainElement(iframeElement);
    expect(pluginSlot).toContainElement(directHomeElement);
  });

  it('should order each Plugin by priority', () => {
    const { container, getByTestId } = render(TestPluginSlot);
    const iframeElement = container.querySelector('iframe');
    const directHomeElement = getByTestId(directHomeConfig.id);
    const pluginSlot = getByTestId('test-slot-id');

    // Dispatch a 'ready' event manually.
    const readyEvent = new Event('message');
    readyEvent.data = {
      type: 'PLUGIN_READY',
    };
    readyEvent.source = iframeElement.contentWindow;
    fireEvent(window, readyEvent);

    expect(pluginSlot.children[0]).toEqual(iframeElement);
    expect(pluginSlot.children[1]).toEqual(directHomeElement);
  });

  it('should wrap a Plugin when using the "wrap" operation', () => {
    usePluginSlot.mockReturnValueOnce({
      plugins: [
        {
          op: 'wrap',
          widgetId: 'home',
          wrapper: ({ component, idx }) => (
            <div key={idx} data-testid={`wrapper${idx + 1}`}>
              {component}
            </div>
          ),
        },
      ],
      defaultContents: [
        directHomeConfig,
      ],
    });

    const { getByTestId } = render(TestPluginSlot);
    const wrapper1 = getByTestId('wrapper1');
    const directHomeElement = getByTestId(directHomeConfig.id);

    expect(wrapper1).toContainElement(directHomeElement);
  });

  it('should not render a Plugin when using the "hide" operation', () => {
    usePluginSlot.mockReturnValueOnce({
      plugins: [
        {
          op: 'hide',
          widgetId: 'home',
        },
      ],
      defaultContents: [
        directHomeConfig,
      ],
    });
    const { queryByTestId } = render(TestPluginSlot);

    expect(queryByTestId(directHomeConfig.id)).not.toBeInTheDocument();
  });

  it('should throw an error for invalid config type', () => {
    usePluginSlot.mockReturnValueOnce({
      plugins: [
        {
          op: 'insert',
          widget: {
            id: 'invalid_config',
            type: 'INVALID_TYPE',
          },
        },
      ],
      defaultContents: [
        directHomeConfig,
      ],
    });
    render(TestPluginSlot);

    expect(logError).toHaveBeenCalledWith('Config type INVALID_TYPE is not valid.');
  });
});
