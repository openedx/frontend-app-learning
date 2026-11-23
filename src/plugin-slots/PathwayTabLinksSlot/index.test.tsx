import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PathwayTabLinksSlot } from './index';

const tabs = [
  { tabId: 'home', title: 'Home', url: '/pathway/pathway-1/home' },
  { tabId: 'progress', title: 'Progress', url: '/pathway/pathway-1/progress' },
];

describe('PathwayTabLinksSlot', () => {
  it('renders the plugin slot with the pathway tab links as its default content', () => {
    render(<PathwayTabLinksSlot tabs={tabs} activeTabSlug="progress" />, { wrapper: MemoryRouter });

    const slot = screen.getByTestId('org.openedx.frontend.learning.pathway_tab_links.v1');
    expect(slot).toContainElement(screen.getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/pathway/pathway-1/home');
    expect(screen.getByRole('link', { name: 'Progress' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('active');
  });
});
