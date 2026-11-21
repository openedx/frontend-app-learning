import { render, screen } from '@testing-library/react';

import { ItemBadge, ItemBadgeProps } from './ItemBadge';

const renderComponent = (props: Partial<ItemBadgeProps> = {}) => render(
  <ItemBadge categoryLabel="Bootcamp" {...props} />,
);

describe('ItemBadge', () => {
  it('renders the category label with the default colors', () => {
    renderComponent();
    const badge = screen.getByText('Bootcamp');
    expect(badge).toHaveClass('p-1.5', 'bg-info-200', 'text-info-800');
    expect(badge).not.toHaveAttribute('style');
  });

  it('renders the custom colors instead of the default ones', () => {
    renderComponent({ categoryBackgroundColor: '#FCE4F3', categoryTextColor: '#9B1766' });
    const badge = screen.getByText('Bootcamp');
    expect(badge.style.backgroundColor).toBe('rgb(252, 228, 243)');
    expect(badge.style.color).toBe('rgb(155, 23, 102)');
    expect(badge).not.toHaveClass('bg-info-200');
    expect(badge).not.toHaveClass('text-info-800');
  });

  it.each([
    ['the text color is missing', { categoryBackgroundColor: '#FCE4F3' }],
    ['a color is not valid', { categoryBackgroundColor: 'not-a-color', categoryTextColor: '#9B1766' }],
  ])('uses the default colors when %s', (_description, colors) => {
    renderComponent(colors);
    const badge = screen.getByText('Bootcamp');
    expect(badge).toHaveClass('bg-info-200', 'text-info-800');
    expect(badge).not.toHaveAttribute('style');
  });
});
