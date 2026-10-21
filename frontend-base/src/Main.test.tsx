import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from '@openedx/frontend-base';
import Main from './Main';

describe('Main', () => {
  it('sets the document title from the page-title message and site name', async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </IntlProvider>
    );
    await waitFor(() => {
      expect(document.title).toBe('Template | Template Test Site');
    });
  });
});
