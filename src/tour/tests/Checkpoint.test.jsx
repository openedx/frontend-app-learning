/**
 * @jest-environment jsdom
 */
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as popper from '@popperjs/core';

import Checkpoint from '../Checkpoint';

Enzyme.configure({ adapter: new Adapter() });
const popperMock = jest.spyOn(popper, 'createPopper');

describe('Checkpoint', () => {
  const handleAdvance = jest.fn();
  const handleDismiss = jest.fn();
  const handleEnd = jest.fn();

  beforeEach(() => {
    popperMock.mockImplementation(jest.fn());
  });

  afterEach(() => {
    popperMock.mockReset();
  });

  describe('second Checkpoint in Tour', () => {
    beforeEach(() => {
      render(
        <>
          <div id="target-element">...</div>
          <Checkpoint
            advanceButtonText="Next"
            body="Lorem ipsum checkpoint body"
            dismissButtonText="Dismiss"
            endButtonText="End"
            index={1}
            onAdvance={handleAdvance}
            onDismiss={handleDismiss}
            onEnd={handleEnd}
            target="#target-element"
            title="Checkpoint title"
            totalCheckpoints={5}
          />
        </>,
      );
    });

    it('renders correct active breadcrumb', async () => {
      expect(screen.getByText('Checkpoint title')).toBeInTheDocument();
      const breadcrumbs = screen.getAllByTestId('checkpoint-popover_breadcrumb_', { exact: false });
      expect(breadcrumbs.length).toEqual(5);
      expect(breadcrumbs.at(0).classList.contains('checkpoint-popover_breadcrumb_inactive')).toBe(true);
      expect(breadcrumbs.at(1).classList.contains('checkpoint-popover_breadcrumb_active')).toBe(true);
      expect(breadcrumbs.at(2).classList.contains('checkpoint-popover_breadcrumb_inactive')).toBe(true);
      expect(breadcrumbs.at(3).classList.contains('checkpoint-popover_breadcrumb_inactive')).toBe(true);
      expect(breadcrumbs.at(4).classList.contains('checkpoint-popover_breadcrumb_inactive')).toBe(true);
    });

    it('only renders advance and dismiss buttons (i.e. does not render end button)', () => {
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });

    it('dismiss button onClick calls handleDismiss', () => {
      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.click(dismissButton);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('advance button onClick calls handleAdvance', () => {
      const advanceButton = screen.getByRole('button', { name: 'Next' });
      fireEvent.click(advanceButton);
      expect(handleAdvance).toHaveBeenCalledTimes(1);
    });
  });

  describe('last Checkpoint in Tour', () => {
    beforeEach(() => {
      render(
        <>
          <div id="#last-element" />
          <Checkpoint
            advanceButtonText="Next"
            body="Lorem ipsum checkpoint body"
            dismissButtonText="Dismiss"
            endButtonText="End"
            index={4}
            onAdvance={handleAdvance}
            onDismiss={handleDismiss}
            onEnd={handleEnd}
            target="#last-element"
            title="Checkpoint title"
            totalCheckpoints={5}
          />
        </>,
      );
    });

    it('only renders end button (i.e. neither advance nor dismiss buttons)', () => {
      expect(screen.getByRole('button', { name: 'End' })).toBeInTheDocument();
    });

    it('end button onClick calls handleEnd', () => {
      const endButton = screen.getByRole('button', { name: 'End' });
      fireEvent.click(endButton);
      expect(handleEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('only one Checkpoint in Tour', () => {
    beforeEach(() => {
      render(
        <>
          <div id="#target-element" />
          <Checkpoint
            advanceButtonText="Next"
            body="Lorem ipsum checkpoint body"
            dismissButtonText="Dismiss"
            endButtonText="End"
            index={0}
            onAdvance={handleAdvance}
            onDismiss={handleDismiss}
            onEnd={handleEnd}
            target="#target-element"
            title="Checkpoint title"
            totalCheckpoints={1}
          />
        </>,
      );
    });

    it('only renders end button (i.e. neither advance nor dismiss buttons)', () => {
      expect(screen.getByRole('button', { name: 'End' })).toBeInTheDocument();
    });

    it('does not render breadcrumbs', () => {
      const breadcrumbs = screen.queryAllByTestId('checkpoint-popover_breadcrumb_', { exact: false });
      expect(breadcrumbs.length).toEqual(0);
    });
  });
});
