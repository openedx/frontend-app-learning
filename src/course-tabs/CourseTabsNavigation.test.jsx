import React from 'react';
import { initializeMockApp, render, screen } from '../setupTest';
import { CourseTabsNavigation } from './index';

describe('Course Tabs Navigation', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  it('renders without tabs', () => {
    render(<CourseTabsNavigation tabs={[]} />);
    expect(screen.getByRole('button', { name: 'More...' })).toBeInTheDocument();
  });

  it('renders with tabs', () => {
    const tabs = [
      { url: 'http://test-url1', title: 'Item 1', slug: 'test1' },
      { url: 'http://test-url2', title: 'Item 2', slug: 'test2' },
    ];
    const mockData = {
      tabs,
      activeTabSlug: tabs[0].slug,
    };
    render(<CourseTabsNavigation {...mockData} />);

    expect(screen.getByRole('link', { name: tabs[0].title })).toHaveAttribute('href', tabs[0].url);
    expect(screen.getByRole('link', { name: tabs[0].title })).toHaveClass('active');

    expect(screen.getByRole('link', { name: tabs[1].title })).toHaveAttribute('href', tabs[1].url);
    expect(screen.getByRole('link', { name: tabs[1].title })).not.toHaveClass('active');
  });
});
