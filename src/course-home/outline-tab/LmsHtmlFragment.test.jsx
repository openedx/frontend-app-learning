import React from 'react';
import { render } from '@testing-library/react';
import LmsHtmlFragment from './LmsHtmlFragment';
import { getConfig } from '@edx/frontend-platform';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

describe('LmsHtmlFragment', () => {
  it('renders an iframe with the correct title', () => {
    const { getByTitle } = render(
      <LmsHtmlFragment
        title="Test Title"
        html="<p>Test Content</p>"
        className="test-class"
      />,
    );

    const iframe = getByTitle('Test Title');
    expect(iframe).toBeInTheDocument();
  });

  it('sets the srcDoc property with the correct content and className', () => {
    const { getByTitle } = render(
      <LmsHtmlFragment
        title="Test Title"
        html="<p>Test Content</p>"
        className="test-class"
      />,
    );

    const iframe = getByTitle('Test Title');
    const srcDocContent = iframe.getAttribute('srcDoc');

    expect(srcDocContent).toContain('<p>Test Content</p>');
    expect(srcDocContent).toContain('class="test-class"');
  });

  it('throws an error if BASE_URL is not defined', () => {
    getConfig.mockReturnValue({
      BASE_URL: undefined,
    });

    expect(() => {
      render(
        <LmsHtmlFragment
          title="Test Title"
          html="<p>Test Content</p>"
          className="test-class"
        />,
      );
    }).toThrow('BASE_URL is not defined or is invalid in the configuration.');
  });

  it('throws an error if BASE_URL is not defined or invalid', () => {
    const invalidBaseUrls = [undefined, null, 123, {}, []];

    invalidBaseUrls.forEach((invalidBaseUrl) => {
      getConfig.mockReturnValue({
        BASE_URL: invalidBaseUrl,
      });

      expect(() => {
        render(
          <LmsHtmlFragment
            title="Test Title"
            html="<p>Test Content</p>"
            className="test-class"
          />,
        );
      }).toThrow('BASE_URL is not defined or is invalid in the configuration.');
    });
  });
});
