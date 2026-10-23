import React from 'react';
import { render, screen } from '@testing-library/react';

import PageLoading from './PageLoading';

describe('PageLoading', () => {
  it('gives the spinner its screen-reader message', () => {
    render(<PageLoading srMessage="Loading course page…" />);
    expect(screen.getByText('Loading course page…')).toHaveClass('sr-only');
  });

  it('renders no screen-reader text for an empty message', () => {
    const { container } = render(<PageLoading srMessage="" />);
    expect(container.querySelector('.sr-only')).toBeNull();
  });
});
