import React from 'react';
import { render } from '@testing-library/react';
import LmsHtmlFragment from './LmsHtmlFragment';

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
});
