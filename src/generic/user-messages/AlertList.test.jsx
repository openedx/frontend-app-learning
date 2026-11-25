import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '@src/tests/render';
import { ALERT_TYPES, AlertList, UserMessagesContext } from './index';

const renderAlertList = (props) => {
  let context;
  const CaptureContext = () => {
    context = useContext(UserMessagesContext);
    return null;
  };
  const rendered = render(
    <>
      <CaptureContext />
      <AlertList {...props} />
    </>,
  );
  const add = (message) => act(() => {
    context.add(message);
  });
  return { ...rendered, add };
};

describe('Alert List', () => {
  it('renders nothing when no message is added', () => {
    const { container } = renderAlertList({ topic: 'outline' });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an added message as an alert of its type, under the given class', () => {
    const { add } = renderAlertList({ topic: 'outline', className: 'list' });
    add({
      code: 'clientTestAlert', topic: 'outline', type: ALERT_TYPES.INFO, text: 'Hello',
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Hello');
    expect(alert).toHaveClass('alert-info');
    expect(alert.parentElement).toHaveClass('list');
  });

  it.each([
    [ALERT_TYPES.ERROR, 'alert-warning'],
    [ALERT_TYPES.DANGER, 'alert-danger'],
    [ALERT_TYPES.SUCCESS, 'alert-success'],
  ])('renders an %s message with the %s variant', (type, variantClass) => {
    const { add } = renderAlertList({ topic: 'outline' });
    add({
      code: 'clientTestAlert', topic: 'outline', type, text: 'Hello',
    });
    expect(screen.getByRole('alert')).toHaveClass(variantClass);
  });

  it('shows only the messages of its topic', () => {
    const { add } = renderAlertList({ topic: 'dates' });
    add({ code: 'outlineAlert', topic: 'outline', type: ALERT_TYPES.INFO, text: 'Outline' });
    add({ code: 'datesAlert', topic: 'dates', type: ALERT_TYPES.SUCCESS, text: 'Dates' });
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Dates');
  });

  it('shows every message when it has no topic', () => {
    const { add } = renderAlertList({});
    add({ code: 'outlineAlert', topic: 'outline', type: ALERT_TYPES.INFO, text: 'Outline' });
    add({ code: 'datesAlert', topic: 'dates', type: ALERT_TYPES.SUCCESS, text: 'Dates' });
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('renders a custom alert for a message code, with the payload and the custom props', () => {
    const Custom = ({ payload, extra }) => <p>{`${payload.name} ${extra}`}</p>;
    Custom.propTypes = {
      payload: PropTypes.shape({ name: PropTypes.string }).isRequired,
      extra: PropTypes.string.isRequired,
    };
    const { add } = renderAlertList({
      topic: 'outline', customAlerts: { clientTestAlert: Custom }, customProps: { extra: 'prop' },
    });
    add({ code: 'clientTestAlert', topic: 'outline', payload: { name: 'payload' } });
    expect(screen.getByText('payload prop')).toBeInTheDocument();
  });

  it('removes a dismissed message', async () => {
    const user = userEvent.setup();
    const { add } = renderAlertList({ topic: 'outline' });
    add({
      code: 'clientTestAlert', topic: 'outline', type: ALERT_TYPES.INFO, text: 'Hello', dismissible: true,
    });
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
