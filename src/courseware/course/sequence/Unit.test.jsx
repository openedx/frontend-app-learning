import React from 'react';
import { cloneDeep } from 'lodash';
import {
  initialState, loadUnit, messageEvent, render, screen, waitFor,
} from '../../../setupTest';
import Unit from './Unit';

describe('Unit', () => {
  const mockData = {
    id: '3',
    courseId: '1',
    intl: {},
  };

  it('renders correctly', () => {
    render(<Unit {...mockData} />, { initialState });

    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(0));
    expect(screen.getByTitle(mockData.id)).toHaveAttribute(
      'src', `http://localhost:18000/xblock/${mockData.id}?show_title=0&show_bookmark_button=0`,
    );
  });

  it('renders proper message for gated content', () => {
    // Clone initialState.
    const testState = cloneDeep(initialState);
    testState.models.units[mockData.id].graded = true;
    render(<Unit {...mockData} />, { initialState: testState });

    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
  });

  it('handles receiving MessageEvent', async () => {
    render(<Unit {...mockData} />, { initialState });
    loadUnit();

    // Loading message is gone now.
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // Iframe's height is set via message.
    expect(screen.getByTitle(mockData.id)).toHaveAttribute('height', String(messageEvent.payload.height));
  });

  it('calls onLoaded after receiving MessageEvent', async () => {
    const onLoaded = jest.fn();
    render(<Unit {...mockData} {...{ onLoaded }} />, { initialState });
    loadUnit();

    await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));
  });

  it('resizes iframe on second MessageEvent, does not call onLoaded again', async () => {
    const onLoaded = jest.fn();
    // Clone message and set different height.
    const testMessageWithOtherHeight = { ...messageEvent, payload: { height: 200 } };
    render(<Unit {...mockData} {...{ onLoaded }} />, { initialState });
    loadUnit();

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
    )).rejects.toThrowError(/Expected the element to have attribute/);
  });
});
