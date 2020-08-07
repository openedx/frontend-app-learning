import React from 'react';
import {
  render, screen, fireEvent, initializeMockApp,
} from '../../setupTest';
import { Alert, ALERT_TYPES } from './index';

describe('Alert', () => {
  const types = {
    [ALERT_TYPES.ERROR]: {
      alert_class: 'alert-warning',
      icon: 'fa-exclamation-triangle',
    },
    [ALERT_TYPES.DANGER]: {
      alert_class: 'alert-danger',
      icon: 'fa-minus-circle',
    },
    [ALERT_TYPES.SUCCESS]: {
      alert_class: 'alert-success',
      icon: 'fa-check-circle',
    },
    [ALERT_TYPES.INFO]: {
      alert_class: 'alert-info',
      icon: 'fa-info-circle',
    },
  };

  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });

  Object.entries(types).forEach(([alert, properties]) => {
    it(`renders ${alert} alert`, () => {
      const alertContent = 'Test alert.';
      const { container } = render(<Alert type={alert}>{alertContent}</Alert>);

      expect(container.firstChild).toHaveClass(properties.alert_class);
      expect(container.querySelector('svg')).toHaveClass(properties.icon);
      expect(screen.getByText(alertContent)).toBeInTheDocument();
    });
  });

  it('is dismissible', () => {
    const onDismiss = jest.fn();
    const { container } = render(<Alert type={ALERT_TYPES.ERROR} dismissible {...{ onDismiss }} />);

    expect(container.firstChild).toHaveClass('alert-dismissible');

    const dismissButton = screen.getByRole('button');
    expect(container.querySelector('svg')).toHaveClass('fa-exclamation-triangle');

    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
