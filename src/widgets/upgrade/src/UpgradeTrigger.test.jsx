import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import * as localStorageModule from '@src/data/localStorage';
import { UpgradeWidgetProvider } from './UpgradeWidgetContext';
import UpgradeTrigger from './UpgradeTrigger';

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(() => null),
  setLocalStorage: jest.fn(),
}));

const courseId = 'course-test-123';

function renderTrigger(sidebarContextOverrides = {}, localStorageOverride = null) {
  localStorageModule.getLocalStorage.mockImplementation((key) => {
    if (localStorageOverride) {
      return localStorageOverride(key);
    }
    return null;
  });

  return render(
    <IntlProvider locale="en">
      <SidebarContext.Provider value={{ courseId, ...sidebarContextOverrides }}>
        <UpgradeWidgetProvider>
          <UpgradeTrigger onClick={jest.fn()} />
        </UpgradeWidgetProvider>
      </SidebarContext.Provider>
    </IntlProvider>,
  );
}

describe('UpgradeTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a button with the correct aria-label', () => {
    renderTrigger();

    expect(screen.getByRole('button', { name: /show upgrade panel/i })).toBeInTheDocument();
  });

  it('renders the UpgradeIcon inside the button', () => {
    renderTrigger();
    const button = screen.getByRole('button', { name: /show upgrade panel/i });

    expect(button).toBeInTheDocument();
  });

  it('calls the onClick prop when the button is clicked', () => {
    const onClick = jest.fn();
    render(
      <IntlProvider locale="en">
        <SidebarContext.Provider value={{ courseId }}>
          <UpgradeWidgetProvider>
            <UpgradeTrigger onClick={onClick} />
          </UpgradeWidgetProvider>
        </SidebarContext.Provider>
      </IntlProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /show upgrade panel/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows status dot when upgradeWidgetStatus is "active"', () => {
    // Default status from localStorage is null, so provider defaults to "active"
    renderTrigger();

    expect(screen.getByTestId('upgrade-status-dot')).toBeInTheDocument();
  });

  it('does not show status dot when upgradeWidgetStatus is "inactive" from localStorage', () => {
    renderTrigger({}, (key) => {
      if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
      return null;
    });

    expect(screen.queryByTestId('upgrade-status-dot')).not.toBeInTheDocument();
  });

  it('sets status to active and updates lastSeen when upgradeCurrentState differs from last seen', () => {
    renderTrigger({}, (key) => {
      if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
      if (key === `upgradeWidgetState.${courseId}`) { return 'new-state'; }
      if (key === `upgradeWidgetLastSeen.${courseId}`) { return 'old-state'; }
      return null;
    });

    expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
      `upgradeWidgetLastSeen.${courseId}`,
      'new-state',
    );
    expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
      `upgradeWidget.${courseId}`,
      'active',
    );
  });

  it('does not update status when upgradeCurrentState matches last seen', () => {
    renderTrigger({}, (key) => {
      if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
      if (key === `upgradeWidgetState.${courseId}`) { return 'same-state'; }
      if (key === `upgradeWidgetLastSeen.${courseId}`) { return 'same-state'; }
      return null;
    });

    expect(localStorageModule.setLocalStorage).not.toHaveBeenCalledWith(
      `upgradeWidget.${courseId}`,
      'active',
    );
  });
});
