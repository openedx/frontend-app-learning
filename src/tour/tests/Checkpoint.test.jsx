/**
 * @jest-environment jsdom
 */
import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import React from 'react';

import Checkpoint from '../Checkpoint';

Enzyme.configure({ adapter: new Adapter() });

describe('Checkpoint', () => {
  const handleAdvance = jest.fn();
  const handleDismiss = jest.fn();
  const handleEnd = jest.fn();

  describe('second Checkpoint in Tour', () => {
    const secondCheckpointWrapper = mount((
      <Checkpoint
        advanceButtonText="Next"
        body="Lorem ipsum checkpoint body"
        dismissButtonText="Dismiss"
        endButtonText="End"
        index={1}
        onAdvance={handleAdvance}
        onDismiss={handleDismiss}
        onEnd={handleEnd}
        title="Checkpoint title"
        totalCheckpoints={5}
      />
    ));

    it('renders correct active breadcrumb', () => {
      const breadcrumbs = secondCheckpointWrapper.find('svg');
      expect(breadcrumbs.length).toEqual(5);
      expect(breadcrumbs.at(0).exists('.checkpoint-popover_breadcrumb_inactive')).toBe(true);
      expect(breadcrumbs.at(1).exists('.checkpoint-popover_breadcrumb_active')).toBe(true);
      expect(breadcrumbs.at(2).exists('.checkpoint-popover_breadcrumb_inactive')).toBe(true);
      expect(breadcrumbs.at(3).exists('.checkpoint-popover_breadcrumb_inactive')).toBe(true);
      expect(breadcrumbs.at(4).exists('.checkpoint-popover_breadcrumb_inactive')).toBe(true);
    });

    it('only renders advance and dismiss buttons (i.e. does not render end button)', () => {
      const buttons = secondCheckpointWrapper.find('button');
      expect(buttons.length).toEqual(2);

      const dismissButton = buttons.at(0);
      expect(dismissButton.text()).toEqual('Dismiss');

      const advanceButton = buttons.at(1);
      expect(advanceButton.text()).toEqual('Next');
    });

    it('dismiss button onClick calls handleDismiss', () => {
      const dismissButton = secondCheckpointWrapper.find('button').at(0);
      dismissButton.simulate('click');
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('advance button onClick calls handleAdvance', () => {
      const advanceButton = secondCheckpointWrapper.find('button').at(1);
      advanceButton.simulate('click');
      expect(handleAdvance).toHaveBeenCalledTimes(1);
    });
  });

  describe('last Checkpoint in Tour', () => {
    const lastCheckpointWrapper = mount((
      <Checkpoint
        advanceButtonText="Next"
        body="Lorem ipsum checkpoint body"
        dismissButtonText="Dismiss"
        endButtonText="End"
        index={4}
        onAdvance={handleAdvance}
        onDismiss={handleDismiss}
        onEnd={handleEnd}
        title="Checkpoint title"
        totalCheckpoints={5}
      />
    ));

    it('only renders end button (i.e. neither advance nor dismiss buttons)', () => {
      const endButton = lastCheckpointWrapper.find('button');
      expect(endButton.exists()).toBe(true);
      expect(endButton.text()).toEqual('End');
    });

    it('end button onClick calls handleEnd', () => {
      const endButton = lastCheckpointWrapper.find('button');
      endButton.simulate('click');
      expect(handleEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('only one Checkpoint in Tour', () => {
    const singleCheckpointWrapper = mount((
      <Checkpoint
        advanceButtonText="Next"
        body="Lorem ipsum checkpoint body"
        dismissButtonText="Dismiss"
        endButtonText="End"
        index={0}
        onAdvance={handleAdvance}
        onDismiss={handleDismiss}
        onEnd={handleEnd}
        title="Checkpoint title"
        totalCheckpoints={1}
      />
    ));

    it('only renders end button (i.e. neither advance nor dismiss buttons)', () => {
      const endButton = singleCheckpointWrapper.find('button');
      expect(endButton.length).toEqual(1);
      expect(endButton.exists()).toBe(true);
      expect(endButton.text()).toEqual('End');
    });

    it('does not render breadcrumbs', () => {
      expect(singleCheckpointWrapper.exists('.checkpoint-popover_breadcrumb_inactive')).toBe(false);
      expect(singleCheckpointWrapper.exists('.checkpoint-popover_breadcrumb_active')).toBe(false);
    });
  });
});
