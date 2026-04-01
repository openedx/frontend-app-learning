import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import UpgradeIcon from './UpgradeIcon';

function renderIcon(props = {}) {
  return render(
    <IntlProvider locale="en">
      <UpgradeIcon upgradeColor="bg-danger-500" {...props} />
    </IntlProvider>,
  );
}

describe('UpgradeIcon', () => {
  it('renders without crashing', () => {
    renderIcon();
  });

  it('shows the status dot when status is "active"', () => {
    renderIcon({ status: 'active' });

    expect(screen.getByTestId('upgrade-status-dot')).toBeInTheDocument();
  });

  it('does not show the status dot when status is null (default)', () => {
    renderIcon({ status: null });

    expect(screen.queryByTestId('upgrade-status-dot')).not.toBeInTheDocument();
  });

  it('does not show the status dot when status is "inactive"', () => {
    renderIcon({ status: 'inactive' });

    expect(screen.queryByTestId('upgrade-status-dot')).not.toBeInTheDocument();
  });

  it('applies the upgradeColor class to the status dot', () => {
    renderIcon({ status: 'active', upgradeColor: 'bg-warning-500' });

    const dot = screen.getByTestId('upgrade-status-dot');
    expect(dot).toHaveClass('bg-warning-500');
  });

  it('does not apply upgradeColor class when status is not active', () => {
    renderIcon({ status: null, upgradeColor: 'bg-danger-500' });

    expect(screen.queryByTestId('upgrade-status-dot')).not.toBeInTheDocument();
  });
});
