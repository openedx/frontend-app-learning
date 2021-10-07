import React from 'react';
import { initializeMockApp, render } from '../../setupTest';
import { AlertList } from './index';

describe('Alert List', () => {
  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });

  it('renders empty div by default', () => {
    const { container } = render(<AlertList />);
    expect(container).toBeEmptyDOMElement();
  });

  // FIXME: Currently these alerts are tested in `OutlineTab.test` and `Course.test`, because creating
  //  `UserMessagesProvider` for testing would introduce a lot of boilerplate code that could get outdated quickly.
});
