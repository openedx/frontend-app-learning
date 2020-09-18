import React from 'react';
import { initializeMockApp, render, screen } from '../../setupTest';
import Tabs from './Tabs';
import useIndexOfLastVisibleChild from './useIndexOfLastVisibleChild';

jest.mock('./useIndexOfLastVisibleChild');

describe('Tabs', () => {
  const mockChildren = [...Array(4).keys()].map(i => (<button key={i} type="button">{`Item ${i}`}</button>));
  // Only half of the children will be visible. The rest of them will be in the dropdown.
  const indexOfLastVisibleChild = mockChildren.length / 2 - 1;
  const invisibleStyle = { visibility: 'hidden' };
  useIndexOfLastVisibleChild.mockReturnValue([indexOfLastVisibleChild, null, invisibleStyle, null]);

  beforeAll(async () => {
    initializeMockApp();
  });

  it('renders without children', () => {
    render(<Tabs />);
    expect(screen.getByRole('button', { name: 'More...' })).toBeInTheDocument();
  });

  it('hides invisible children', async () => {
    render(<Tabs>{mockChildren}</Tabs>);

    [...Array(mockChildren.length).keys()].forEach(i => {
      const button = screen.getByRole('button', { name: `Item ${i}` });
      if (i <= indexOfLastVisibleChild) {
        expect(button).not.toHaveAttribute('style');
      } else {
        // FIXME: this should use `toHaveStyle`, but it does not detect any style.
        expect(button).toHaveAttribute('style', 'visibility: hidden;');
      }
    });
  });
});
