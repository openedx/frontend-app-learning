import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { PathwayOverview } from './PathwayOverview';

const renderComponent = (completed: number, total: number, detailsUrl?: string) => render(
  <IntlProvider locale="en">
    <PathwayOverview categoryLabel="Bootcamp" completed={completed} total={total} detailsUrl={detailsUrl} />
  </IntlProvider>,
);

describe('PathwayOverview', () => {
  it('shows the category in the title', () => {
    renderComponent(0, 6);
    expect(screen.getByRole('heading', { name: 'Bootcamp overview' })).toBeInTheDocument();
  });

  it('shows the completed items in the donut and below it', () => {
    renderComponent(2, 6);
    expect(screen.getByRole('img', { name: '2 of 6 items completed' })).toBeInTheDocument();
    expect(screen.getByText('2 of 6 courses')).toBeInTheDocument();
  });

  it('uses the singular when the pathway has one course', () => {
    renderComponent(0, 1);
    expect(screen.getByText('0 of 1 course')).toBeInTheDocument();
  });

  it('links to the pathway details page', () => {
    renderComponent(0, 6, 'https://catalog.example.com/catalog/pathways/data-engineering');
    expect(screen.getByRole('link', { name: 'About this bootcamp' })).toHaveAttribute(
      'href',
      'https://catalog.example.com/catalog/pathways/data-engineering',
    );
  });

  it('does not show the details link without a URL', () => {
    renderComponent(0, 6);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
