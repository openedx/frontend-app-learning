import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ShareButton from './ShareButton';
import messages from './messages';

describe('ShareButton', () => {
  const url = 'https://example.com/course';

  const renderComponent = () => render(
    <IntlProvider locale="en" messages={{}}>
      <ShareButton url={url} />
    </IntlProvider>,
  );

  it('renders the button with correct text', () => {
    renderComponent();
    expect(screen.getByText(messages.shareButton.defaultMessage)).toBeInTheDocument();
  });

  it('renders the Twitter icon', () => {
    renderComponent();
    const svg = screen.getByText(messages.shareButton.defaultMessage).querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
