import React, { useContext } from 'react';
import { act, render } from '@testing-library/react';

import { ALERT_TYPES, UserMessagesContext, UserMessagesProvider } from './index';

const flashMessagesKey = 'UserMessagesProvider.flashMessages';

const renderProvider = () => {
  let context;
  const CaptureContext = () => {
    context = useContext(UserMessagesContext);
    return null;
  };
  render(<UserMessagesProvider><CaptureContext /></UserMessagesProvider>);
  return () => context;
};

describe('UserMessagesProvider', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('shows the flash messages saved before the page loaded, and forgets them', () => {
    localStorage.setItem(flashMessagesKey, JSON.stringify([
      { code: 'clientFlashAlert', topic: 'outline', type: ALERT_TYPES.SUCCESS, text: 'Saved' },
    ]));
    const context = renderProvider();

    expect(context().messages).toEqual([expect.objectContaining({ code: 'clientFlashAlert', text: 'Saved' })]);
    expect(localStorage.getItem(flashMessagesKey)).toBeNull();
  });

  it('clears the messages of one topic, or every message', () => {
    const context = renderProvider();
    act(() => {
      context().add({ code: 'outlineAlert', topic: 'outline' });
      context().add({ code: 'datesAlert', topic: 'dates' });
    });

    act(() => context().clear('outline'));
    expect(context().messages.map(message => message.code)).toEqual(['datesAlert']);

    act(() => context().clear());
    expect(context().messages).toEqual([]);
  });

  it('adds a flash message to the ones already saved', () => {
    const context = renderProvider();
    context().addFlash({ code: 'firstFlash' });
    context().addFlash({ code: 'secondFlash' });

    expect(JSON.parse(localStorage.getItem(flashMessagesKey))).toEqual([{ code: 'firstFlash' }, { code: 'secondFlash' }]);
  });

  it('starts a new list of flash messages when the saved value is not a list', () => {
    const context = renderProvider();
    localStorage.setItem(flashMessagesKey, JSON.stringify({ code: 'notAList' }));
    context().addFlash({ code: 'flash' });

    expect(JSON.parse(localStorage.getItem(flashMessagesKey))).toEqual([{ code: 'flash' }]);
  });
});
