/* eslint-disable react/jsx-no-bind */
/* eslint react/prop-types: off */

import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

import { initializeMockApp } from '@edx/frontend-platform/testing';
import {
  FormattedMessage,
  IntlProvider,
} from '@edx/frontend-platform/i18n';

import PluginContainer from './PluginContainer';
import Plugin from './Plugin';
import {
  DIRECT_PLUGIN, IFRAME_PLUGIN, PLUGIN_MOUNTED, PLUGIN_READY, PLUGIN_RESIZE,
} from './data/constants';
import { IFRAME_FEATURE_POLICY } from './PluginContainerIframe';

const iframeConfig = {
  id: 'iframe_plugin',
  url: 'http://localhost/plugin1',
  type: IFRAME_PLUGIN,
  title: 'test iframe plugin',
  priority: 1,
};

const directConfig = {
  id: 'direct_plugin',
  type: DIRECT_PLUGIN,
  RenderWidget: ({ id, content }) => (<div data-testid={id}>{content.text}</div>),
  priority: 2,
  content: { text: 'This is a direct plugin.' },
};

// Mock ResizeObserver which is unavailable in the context of a test.
global.ResizeObserver = jest.fn(function mockResizeObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

describe('PluginContainer', () => {
  it('should return a blank page with a null plugin configuration', () => {
    // the URL will be empty and an empty div tag will exist where the iFrame should be
    // the iFrame will still take up the space assigned by the host MFE
    const component = (
      <PluginContainer config={null} />
    );

    const { container } = render(component);
    expect(container.firstChild).toBeNull();
  });

  it('should render a Plugin iFrame Container when given an iFrame config', async () => {
    const component = (
      <PluginContainer config={iframeConfig} loadingFallback={<div>Loading</div>} />
    );

    const { container } = render(component);

    const iframeElement = container.querySelector('iframe');
    const fallbackElement = container.querySelector('div');

    expect(iframeElement).toBeInTheDocument();
    expect(fallbackElement).toBeInTheDocument();

    expect(fallbackElement.innerHTML).toEqual('Loading');

    // Ensure the iframe has the proper attributes
    expect(iframeElement.attributes.getNamedItem('allow').value).toEqual(IFRAME_FEATURE_POLICY);
    expect(iframeElement.attributes.getNamedItem('src').value).toEqual(iframeConfig.url);
    expect(iframeElement.attributes.getNamedItem('title').value).toEqual(iframeConfig.title);
    // The component isn't ready, since the class has 'd-none'
    expect(iframeElement.attributes.getNamedItem('class').value).toEqual('border border-0 w-100 d-none');

    jest.spyOn(iframeElement.contentWindow, 'postMessage');

    expect(iframeElement.contentWindow.postMessage).not.toHaveBeenCalled();

    // Dispatch a 'mounted' event manually.
    const mountedEvent = new Event('message');
    mountedEvent.data = {
      type: PLUGIN_MOUNTED,
    };
    mountedEvent.source = iframeElement.contentWindow;
    fireEvent(window, mountedEvent);

    expect(iframeElement.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PLUGIN_RESIZE,
        payload: {
          width: 0, // There's no width/height here in jsdom-land.
          height: 0,
        },
      },
      'http://localhost/plugin1',
    );

    // Dispatch a 'ready' event manually.
    const readyEvent = new Event('message');
    readyEvent.data = {
      type: PLUGIN_READY,
    };
    readyEvent.source = iframeElement.contentWindow;
    fireEvent(window, readyEvent);

    expect(iframeElement.attributes.getNamedItem('class').value).toEqual('border border-0 w-100');
  });

  it('should render a Plugin Direct Container when given a Direct config', async () => {
    const component = (
      <PluginContainer config={directConfig} loadingFallback={<div>Loading</div>} />
    );

    const { getByTestId } = render(component);

    expect(getByTestId(directConfig.id)).toBeInTheDocument();
  });
});

describe('Plugin', () => {
  let logError = jest.fn();

  const error = (
    <FormattedMessage
      id="raised.error.message.text"
      defaultMessage="there is an error in the React component"
      description="raised error message when an error occurs in React component"
    />
  );

  beforeEach(async () => {
    // This is a gross hack to suppress error logs in the invalid parentSelector test
    jest.spyOn(console, 'error');
    global.console.error.mockImplementation(() => {});

    const { loggingService } = initializeMockApp();
    logError = loggingService.logError;
  });

  afterEach(() => {
    global.console.error.mockRestore();
    jest.clearAllMocks();
  });

  const ExplodingComponent = () => {
    throw new Error(error);
  };

  function HealthyComponent() {
    return (
      <div>
        <FormattedMessage
          id="hello.world.message.text"
          defaultMessage="Hello World!"
          description="greeting the world with a hello"
        />
      </div>
    );
  }

  function ErrorFallbackComponent() {
    return (
      <div>
        <p>
          <FormattedMessage
            id="unexpected.error.message.text"
            defaultMessage="Oh geez, this is not good at all."
            description="error message when an unexpected error occurs"
          />
        </p>
        <br />
      </div>
    );
  }

  function PluginPageWrapper({
    params, FallbackComponent, ChildComponent,
  }) {
    return (
      <IntlProvider locale="en">
        <Plugin params={params} ErrorFallbackComponent={FallbackComponent}>
          <ChildComponent />
        </Plugin>
      </IntlProvider>
    );
  }

  it('should render children if no error', () => {
    const component = (
      <PluginPageWrapper
        FallbackComponent={ErrorFallbackComponent}
        ChildComponent={HealthyComponent}
      />
    );
    const { container } = render(component);
    expect(container).toHaveTextContent('Hello World!');
  });

  it('should throw an error if the child component fails', () => {
    const component = (
      <PluginPageWrapper
        className="bg-light"
        FallbackComponent={ErrorFallbackComponent}
        ChildComponent={ExplodingComponent}
      />
    );

    const { container } = render(component);
    expect(container).toHaveTextContent('Oh geez');

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      new Error(error),
      expect.objectContaining({
        stack: expect.stringContaining('ExplodingComponent'),
      }),
    );
  });

  it('should render the default fallback component when one is not passed into the Plugin', () => {
    const component = (
      <PluginPageWrapper
        ChildComponent={ExplodingComponent}
      />
    );

    const { container } = render(component);
    expect(container).toHaveTextContent('Oops! An error occurred.');
  });
});
