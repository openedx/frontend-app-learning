import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';
import { waitFor } from '@testing-library/dom';
import {
  initialState, messageEvent, render, screen,
} from '../../../setupTest';
import Unit from './Unit';

describe('Unit', () => {
  const mockData = {
    id: '3',
    courseId: '1',
    intl: {},
  };

  it('renders correctly', () => {
    const { asFragment } = render(<Unit {...mockData} />, { initialState });

    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(0));
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders proper message for gated content', () => {
    // Clone initialState.
    const testState = cloneDeep(initialState);
    testState.models.units[mockData.id].graded = true;
    const { asFragment } = render(<Unit {...mockData} />, { initialState: testState });

    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('handles receiving MessageEvent', async () => {
    const { asFragment } = render(<Unit {...mockData} />, { initialState });
    const beforePostingMessage = asFragment();

    window.postMessage(messageEvent, '*');
    // Loading message is gone now.
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // Iframe's height is set via message.
    expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(messageEvent.payload.height));
    expect(beforePostingMessage).toMatchDiffSnapshot(asFragment());
  });

  it('handles onLoaded after receiving MessageEvent', async () => {
    const onLoaded = jest.fn();
    render(<Unit {...mockData} {...{ onLoaded }} />, { initialState });

    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));
  });

  it('resizes iframe on second MessageEvent, does not call onLoaded again', async () => {
    const onLoaded = jest.fn();
    // Clone message and set different height.
    const testMessageWithOtherHeight = { ...messageEvent, payload: { height: 200 } };
    render(<Unit {...mockData} {...{ onLoaded }} />, { initialState });

    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(messageEvent.payload.height)));
    window.postMessage(testMessageWithOtherHeight, '*');
    await waitFor(() => expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(testMessageWithOtherHeight.payload.height)));
    expect(onLoaded).toHaveBeenCalledTimes(1);
  });

  it('ignores MessageEvent with unhandled type', async () => {
    // Clone message and set different type.
    const testMessageWithUnhandledType = { ...messageEvent, type: 'wrong type' };
    render(<Unit {...mockData} />, { initialState });

    window.postMessage(testMessageWithUnhandledType, '*');
    // HACK: We don't have a function we could reliably await here, so this test relies on the timeout of `waitFor`.
    await expect(waitFor(
      () => expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(testMessageWithUnhandledType.payload.height)),
      { timeout: 100 },
    )).rejects.toThrowErrorMatchingSnapshot();
  });
});
