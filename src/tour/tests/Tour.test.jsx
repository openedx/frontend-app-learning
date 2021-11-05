/**
 * @jest-environment jsdom
 */
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { fireEvent, render, screen } from '@testing-library/react';
import * as popper from '@popperjs/core';

import Tour from '../Tour';

// This can be removed once the component is ported over to Paragon
Enzyme.configure({ adapter: new Adapter() });

describe('Tour', () => {
  const targets = (
    <>
      <div id="target-1">...</div>
      <div id="target-2">...</div>
      <div id="target-3">...</div>
    </>
  );
  const handleDismiss = jest.fn();
  const handleEnd = jest.fn();
  const customOnDismiss = jest.fn();

  const disabledTourData = {
    advanceButtonText: 'Next',
    dismissButtonText: 'Dismiss',
    enabled: false,
    endButtonText: 'Okay',
    onDismiss: handleDismiss,
    onEnd: handleEnd,
    tourId: 'disabledTour',
    checkpoints: [
      {
        body: 'Lorem ipsum body',
        target: '#target-1',
        title: 'Disabled tour',
      },
    ],
  };

  const tourData = {
    advanceButtonText: 'Next',
    dismissButtonText: 'Dismiss',
    enabled: true,
    endButtonText: 'Okay',
    onDismiss: handleDismiss,
    onEnd: handleEnd,
    tourId: 'enabledTour',
    checkpoints: [
      {
        body: 'Lorem ipsum body',
        target: '#target-1',
        title: 'Checkpoint 1',
      },
      {
        body: 'Lorem ipsum body',
        target: '#target-2',
        title: 'Checkpoint 2',
      },
      {
        body: 'Lorem ipsum body',
        target: '#target-3',
        title: 'Checkpoint 3',
        onDismiss: customOnDismiss,
        advanceButtonText: 'Override advance',
        dismissButtonText: 'Override dismiss',

      },
      {
        target: '#target-3',
        title: 'Checkpoint 4',
        endButtonText: 'Override end',
      },
    ],
  };

  describe('multiple enabled tours', () => {
    it('renders first enabled tour', () => {
      const secondEnabledTourData = {
        advanceButtonText: 'Next',
        dismissButtonText: 'Dismiss',
        enabled: true,
        endButtonText: 'Okay',
        onDismiss: handleDismiss,
        onEnd: handleEnd,
        tourId: 'secondEnabledTour',
        checkpoints: [
          {
            body: 'Lorem ipsum body',
            target: '#target-1',
            title: 'Second enabled tour',
          },
        ],
      };

      const tourWrapper = mount(
        <>
          <Tour
            tours={[disabledTourData, tourData, secondEnabledTourData]}
          />
          {targets}
        </>,
      );

      const checkpointTitle = tourWrapper.find('h2');
      expect(checkpointTitle.text()).toEqual('Checkpoint 1');
      expect(checkpointTitle.text()).not.toEqual('Second enabled tour');
    });
  });

  describe('enabled tour', () => {
    describe('with default settings', () => {
      it('renders checkpoint with correct title, body, and breadcrumbs', () => {
        const tourWrapper = mount(
          <>
            <Tour
              tours={[tourData]}
            />
            {targets}
          </>,
        );
        const checkpoint = tourWrapper.find('#checkpoint');
        const checkpointTitle = checkpoint.find('h2');
        expect(checkpointTitle.text()).toEqual('Checkpoint 1');
        expect(checkpoint.find('svg').at(0).exists('.checkpoint-popover_breadcrumb_active')).toBe(true);
      });

      it('onClick of advance button advances to next checkpoint', () => {
        const tourWrapper = mount(
          <>
            <Tour
              tours={[tourData]}
            />
            {targets}
          </>,
        );

        // Verify the first Checkpoint has rendered
        const firstCheckpoint = tourWrapper.find('#checkpoint');
        const firstCheckpointTitle = firstCheckpoint.find('h2');
        expect(firstCheckpointTitle.text()).toEqual('Checkpoint 1');

        // Click the advance button
        const advanceButton = tourWrapper.find('button').at(1);
        expect(advanceButton.text()).toEqual('Next');

        advanceButton.simulate('click');

        // Verify the second Checkpoint has rendered
        const secondCheckpoint = tourWrapper.find('#checkpoint');
        const secondCheckpointTitle = secondCheckpoint.find('h2');
        expect(secondCheckpointTitle.text()).toEqual('Checkpoint 2');
      });

      it('onClick of dismiss button disables tour', () => {
        const tourWrapper = mount(
          <>
            <Tour
              tours={[tourData]}
            />
            {targets}
          </>,
        );

        // Verify a Checkpoint has rendered
        expect(tourWrapper.exists('#checkpoint')).toBe(true);

        // Click the dismiss button
        const dismissButton = tourWrapper.find('button').at(0);
        expect(dismissButton.text()).toEqual('Dismiss');

        dismissButton.simulate('click');

        // Verify no Checkpoints have rendered
        expect(tourWrapper.exists('#checkpoint')).toBe(false);
      });

      it('onClick of end button disables tour', () => {
        const tourWrapper = mount(
          <>
            <Tour
              tours={[tourData]}
            />
            {targets}
          </>,
        );

        // Verify a Checkpoint has rendered
        expect(tourWrapper.exists('#checkpoint')).toBe(true);

        // Advance the Tour to the last Checkpoint
        const advanceButton = tourWrapper.find('button').at(1);
        advanceButton.simulate('click');
        const advanceButton1 = tourWrapper.find('button').at(1);
        advanceButton1.simulate('click');
        const advanceButton2 = tourWrapper.find('button').at(1);
        advanceButton2.simulate('click');

        // Click the end button
        const endButton = tourWrapper.find('button');
        expect(endButton.text()).toEqual('Override end');

        endButton.simulate('click');

        // Verify no Checkpoints have rendered
        expect(tourWrapper.exists('#checkpoint')).toBe(false);
      });

      it('onClick of escape key disables tour', () => {
        // React Testing Library would not play nice with createPopper
        // due to the order in which the Checkpoint renders. We'll mock
        // out the function here so this test can proceed as expected.
        const mock = jest.spyOn(popper, 'createPopper');
        mock.mockImplementation(jest.fn());

        render(
          <div>
            <Tour
              tours={[tourData]}
            />
            {targets}
          </div>,
        );

        // Verify a Checkpoint has rendered
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Click Escape key
        fireEvent.keyDown(screen.getByRole('dialog'), {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          charCode: 27,
        });

        // Verify no Checkpoints have been rendered
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        mock.mockRestore();
      });
    });

    describe('with Checkpoint override settings', () => {
      it('renders correct checkpoint on index override', () => {
        const overrideTourData = tourData;
        overrideTourData.startingIndex = 2;
        const tourWrapper = mount((
          <>
            <Tour
              tours={[overrideTourData]}
            />
            {targets}
          </>
        ));
        expect(tourWrapper.exists('#checkpoint')).toBe(true);
        const checkpointTitle = tourWrapper.find('h2');
        expect(checkpointTitle.text()).toEqual('Checkpoint 3');
        expect(tourWrapper.find('svg').at(2).exists('.checkpoint-popover_breadcrumb_active'));
      });

      it('applies override for advanceButtonText', () => {
        const overrideTourData = tourData;
        overrideTourData.startingIndex = 2;
        const tourWrapper = mount((
          <>
            <Tour
              tours={[overrideTourData]}
            />
            {targets}
          </>
        ));
        const advanceButton = tourWrapper.find('button').at(1);
        expect(advanceButton.text()).toEqual('Override advance');
      });

      it('applies override for dismissButtonText', () => {
        const overrideTourData = tourData;
        overrideTourData.startingIndex = 2;
        const tourWrapper = mount((
          <>
            <Tour
              tours={[overrideTourData]}
            />
            {targets}
          </>
        ));
        const dismissButton = tourWrapper.find('button').at(0);
        expect(dismissButton.text()).toEqual('Override dismiss');
      });

      it('applies override for endButtonText', () => {
        const overrideTourData = tourData;
        overrideTourData.startingIndex = 3;
        const tourWrapper = mount((
          <>
            <Tour
              tours={[overrideTourData]}
            />
            {targets}
          </>
        ));

        const endButton = tourWrapper.find('button');
        expect(endButton.text()).toEqual('Override end');
      });

      it('calls customHandleDismiss onClick of dismiss button', () => {
        const overrideTourData = tourData;
        overrideTourData.startingIndex = 2;
        const tourWrapper = mount((
          <>
            <Tour
              tours={[overrideTourData]}
            />
            {targets}
          </>
        ));
        const dismissButton = tourWrapper.find('button').at(0);
        expect(dismissButton.text()).toEqual('Override dismiss');
        dismissButton.simulate('click');

        expect(customOnDismiss).toHaveBeenCalledTimes(1);
        expect(tourWrapper.exists('#checkpoint')).toBe(false);
      });
    });

    describe('with invalid Checkpoint', () => {
      it('does not render', () => {
        const badTourData = {
          advanceButtonText: 'Next',
          dismissButtonText: 'Dismiss',
          enabled: true,
          endButtonText: 'Okay',
          onDismiss: handleDismiss,
          onEnd: handleEnd,
          tourId: 'badTour',
          checkpoints: [
            {
              body: 'Lorem ipsum body',
              target: 'bad-target-data',
              title: 'Checkpoint 1',
            },
          ],
        };

        const tourWrapper = mount((
          <>
            <Tour
              tours={[badTourData]}
            />
            {targets}
          </>
        ));

        const checkpoint = tourWrapper.find('#checkpoint');

        expect(checkpoint.props().style.display).toEqual('none');
      });
    });
  });

  describe('disabled tour', () => {
    it('does not render', () => {
      const tourWrapper = mount((
        <>
          <Tour
            tours={[disabledTourData]}
          />
          {targets}
        </>
      ));

      expect(tourWrapper.exists('#checkpoint')).toBe(false);
    });
  });
});
