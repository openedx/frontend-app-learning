import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';

import { PathwayTabsNavigation } from './PathwayTabsNavigation';

const tabs = [
  { tabId: 'home', title: 'Home', url: '/pathway/pathway-1/home' },
  { tabId: 'progress', title: 'Progress', url: '/pathway/pathway-1/progress' },
];

const renderComponent = (activeTabSlug?: string) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <PathwayTabsNavigation tabs={tabs} activeTabSlug={activeTabSlug} />
    </MemoryRouter>
  </IntlProvider>,
);

describe('PathwayTabsNavigation', () => {
  it('renders the tab links inside a labelled navigation', () => {
    renderComponent('home');

    const navigation = screen.getByRole('navigation', { name: 'Pathway Material' });
    expect(navigation).toContainElement(screen.getByRole('link', { name: 'Home' }));
    expect(navigation).toContainElement(screen.getByRole('link', { name: 'Progress' }));
  });
});
