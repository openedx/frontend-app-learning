import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import LiveTab from './LiveTab';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('LiveTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders iframe from liveModel using dangerouslySetInnerHTML', () => {
    useSelector.mockImplementation((selector) => selector({
      courseHome: { courseId: 'course-v1:test+id+2024' },
      models: {
        live: {
          'course-v1:test+id+2024': {
            iframe: '<iframe id="lti-tab-embed" src="about:blank"></iframe>',
          },
        },
      },
    }));

    render(<LiveTab />);

    const iframe = document.getElementById('lti-tab-embed');
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe('about:blank');
  });

  it('adds classes to iframe after mount', () => {
    document.body.innerHTML = `
      <div id="live_tab">
        <iframe id="lti-tab-embed" class=""></iframe>
      </div>
    `;

    useSelector.mockImplementation((selector) => selector({
      courseHome: { courseId: 'course-v1:test+id+2024' },
      models: {
        live: {
          'course-v1:test+id+2024': {
            iframe: '<iframe id="lti-tab-embed"></iframe>',
          },
        },
      },
    }));

    render(<LiveTab />);

    const iframe = document.getElementById('lti-tab-embed');
    expect(iframe.className).toContain('vh-100');
    expect(iframe.className).toContain('w-100');
    expect(iframe.className).toContain('border-0');
  });

  it('does not throw if iframe is not found in DOM', () => {
    useSelector.mockImplementation((selector) => selector({
      courseHome: { courseId: 'course-v1:test+id+2024' },
      models: {
        live: {
          'course-v1:test+id+2024': {
            iframe: '<div>No iframe here</div>',
          },
        },
      },
    }));

    expect(() => render(<LiveTab />)).not.toThrow();
    const iframe = document.getElementById('lti-tab-embed');
    expect(iframe).toBeNull();
  });
});
