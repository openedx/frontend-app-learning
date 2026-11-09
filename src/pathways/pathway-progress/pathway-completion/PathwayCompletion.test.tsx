import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { PathwayCompletion } from './PathwayCompletion';

const renderComponent = () => render(
  <IntlProvider locale="en">
    <PathwayCompletion categoryLabel="Bootcamp" completed={3} total={6} />
  </IntlProvider>,
);

describe('PathwayCompletion', () => {
  it('names the pathway category in its title and description', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'Bootcamp completion' })).toBeInTheDocument();
    expect(
      screen.getByText('This represents how many courses you have completed in this Bootcamp.'),
    ).toBeInTheDocument();
  });
});
