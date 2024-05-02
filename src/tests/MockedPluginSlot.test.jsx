import React from 'react';
import { render, screen } from '@testing-library/react';
import MockedPluginSlot from './MockedPluginSlot';

describe('MockedPluginSlot', () => {
  it('renders as plain "PluginSlot" text node if no clildren nor testId is', () => {
    render(<MockedPluginSlot />);

    const component = screen.getByText('PluginSlot');
    expect(component).toBeInTheDocument();
  });

  it('renders as the slot children directly if there is content within and no testId', () => {
    render(
      <div role="article">
        <MockedPluginSlot>
          <q role="note">How much wood could a woodchuck chuck if a woodchuck could chuck wood?</q>
        </MockedPluginSlot>
      </div>,
    );

    const component = screen.getByRole('article');
    expect(component).toBeInTheDocument();

    // Direct children
    const quote = component.querySelector(':scope > q');
    expect(quote.getAttribute('role')).toBe('note');
  });

  it('renders a div when a testId is provided ', () => {
    render(
      <MockedPluginSlot testId="guybrush">
        <q role="note">I am selling these fine leather jackets.</q>
      </MockedPluginSlot>,
    );

    const component = screen.getByTestId('guybrush');
    expect(component).toBeInTheDocument();

    const quote = component.querySelector('[role=note]');
    expect(quote).toBeInTheDocument();
  });
});
