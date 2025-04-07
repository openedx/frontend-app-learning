import React from 'react';
import { render, screen } from '@testing-library/react';
import MockedPluginSlot from './MockedPluginSlot';

describe('MockedPluginSlot', () => {
  it('renders mock plugin with "PluginSlot" text', () => {
    render(<MockedPluginSlot id="test_plugin" />);

    const component = screen.getByText('PluginSlot_test_plugin');
    expect(component).toBeInTheDocument();
  });

  it('renders mock plugin with a data-testid ', () => {
    render(
      <MockedPluginSlot id="guybrush">
        <q role="note">I am selling these fine leather jackets.</q>
      </MockedPluginSlot>,
    );

    const component = screen.getByTestId('guybrush');
    expect(component).toBeInTheDocument();

    const quote = component.querySelector('[role=note]');
    expect(quote).toBeInTheDocument();
  });
});
