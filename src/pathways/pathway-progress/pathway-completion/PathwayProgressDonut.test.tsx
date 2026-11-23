import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { PathwayProgressDonut } from './PathwayProgressDonut';

const renderComponent = (completed: number, total: number) => render(
  <IntlProvider locale="en">
    <PathwayProgressDonut completed={completed} total={total} />
  </IntlProvider>,
);

const getSegment = (container: HTMLElement) => container.querySelector('.progress-ring-segment');

describe('PathwayProgressDonut', () => {
  it('shows the completed and total items in its center and describes them to assistive technologies', () => {
    renderComponent(1, 6);

    expect(screen.getByText('1/6')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '1 of 6 items completed' })).toBeInTheDocument();
  });

  it('fills the share of the ring that is completed', () => {
    const { container } = renderComponent(3, 6);

    expect(getSegment(container)).toHaveAttribute('stroke-dasharray', '50 50');
  });

  it('does not fill the ring when the pathway has no items', () => {
    const { container } = renderComponent(0, 0);

    expect(getSegment(container)).toBeNull();
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });
});
