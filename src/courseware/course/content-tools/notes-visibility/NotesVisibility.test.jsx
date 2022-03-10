import React from 'react';
import { waitFor } from '@testing-library/dom';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  fireEvent, initializeTestStore, logUnhandledRequests, render, screen,
} from '../../../../setupTest';
import NotesVisibility from './NotesVisibility';

const originalConfig = jest.requireActual('@edx/frontend-platform').getConfig();
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

describe('Notes Visibility', () => {
  let axiosMock;
  let visibilityUrl;
  const mockData = {
    course: {
      id: 'test-course',
      notes: {
        visible: false,
      },
    },
  };

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });

    // Mock `targetOrigin` of the `postMessage`.
    getConfig.mockImplementation(() => originalConfig);
    const config = { ...originalConfig };
    config.LMS_BASE_URL = `${window.location.protocol}//${window.location.host}`;
    getConfig.mockImplementation(() => config);

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    visibilityUrl = `${config.LMS_BASE_URL}/courses/${mockData.course.id}/edxnotes/visibility/`;
  });

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onPut(visibilityUrl).reply(200);
    logUnhandledRequests(axiosMock);
  });

  it('hides notes', () => {
    render(<NotesVisibility {...mockData} />);

    const button = screen.getByRole('switch', { name: 'Show Notes' });
    expect(button).not.toBeChecked();
    expect(button).toHaveClass('text-success');
    expect(button.querySelector('svg')).toHaveClass('fa-pencil-alt');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows notes', () => {
    const testData = JSON.parse(JSON.stringify(mockData));
    testData.course.notes.visible = true;
    render(<NotesVisibility {...testData} />);

    const button = screen.getByRole('switch', { name: 'Hide Notes' });
    expect(button).toBeChecked();
    expect(button).toHaveClass('text-secondary');
    expect(button.querySelector('svg')).toHaveClass('fa-pencil-alt');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles click', async () => {
    const mockFn = jest.fn();
    const frame = document.createElement('iframe');
    frame.id = 'unit-iframe';
    const { container } = render(<NotesVisibility {...mockData} />);

    container.appendChild(frame);
    frame.contentWindow.addEventListener('message', e => {
      mockFn(e.data);
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Show Notes' }));
    await waitFor(() => expect(mockFn).toHaveBeenCalled());
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('tools.toggleNotes');

    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].url).toEqual(visibilityUrl);
    expect(axiosMock.history.put[0].data).toEqual(`{"visibility":${mockData.course.notes.visible}}`);

    expect(screen.getByRole('switch', { name: 'Hide Notes' })).toBeInTheDocument();
  });
});
