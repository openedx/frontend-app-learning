import { render, screen } from '@testing-library/react';

import { ItemBadge } from './ItemBadge';

describe('ItemBadge', () => {
  it('renders the category label with the category colors', () => {
    render(
      <ItemBadge
        categoryLabel="Bootcamp"
        categoryBackgroundColor="#FCE4F3"
        categoryTextColor="#9B1766"
      />,
    );
    const badge = screen.getByText('Bootcamp');
    expect(badge).toHaveClass('p-1.5');
    expect(badge.style.backgroundColor).toBe('rgb(252, 228, 243)');
    expect(badge.style.color).toBe('rgb(155, 23, 102)');
  });
});
