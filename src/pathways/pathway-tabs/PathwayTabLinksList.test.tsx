import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PathwayTabLinksList } from './PathwayTabLinksList';

const tabs = [
  { tabId: 'home', title: 'Home', url: '/pathway/pathway-1/home' },
  { tabId: 'progress', title: 'Progress', url: '/pathway/pathway-1/progress' },
  { tabId: 'achievements', title: 'Achievements', url: '/pathway/pathway-1/achievements' },
];

describe('PathwayTabLinksList', () => {
  it('renders a link for each tab', () => {
    render(<PathwayTabLinksList tabs={tabs} activeTabSlug="home" />, { wrapper: MemoryRouter });

    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Progress' })).toHaveAttribute('href', '/pathway/pathway-1/progress');
  });

  it('highlights only the active tab', () => {
    render(<PathwayTabLinksList tabs={tabs} activeTabSlug="progress" />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: 'Progress' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Achievements' })).not.toHaveClass('active');
  });

  it('highlights no tab without an active tab', () => {
    render(<PathwayTabLinksList tabs={tabs} />, { wrapper: MemoryRouter });

    screen.getAllByRole('link').forEach((link) => expect(link).not.toHaveClass('active'));
  });
});
