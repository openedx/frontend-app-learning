import { useContext } from 'react';
import { renderHook } from '@testing-library/react';

import { UserMessagesContext, UserMessagesProvider } from '../../generic/user-messages';
import useAccessExpirationAlert from './hooks';

const wrapper = ({ children }) => <UserMessagesProvider>{children}</UserMessagesProvider>;

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const accessExpiration = {
  expirationDate: '2020-01-01T12:00:00Z',
  masqueradingExpiredCourse: false,
  upgradeDeadline: null,
  upgradeUrl: null,
};

// Registers the alert the way a page would and exposes what the provider holds.
const useRegisteredMessages = (expiration) => {
  useAccessExpirationAlert(expiration, courseId, 'edX', 'America/New_York', 'outline-course-alerts', 'course_home');
  return useContext(UserMessagesContext)?.messages ?? [];
};

describe('useAccessExpirationAlert', () => {
  it('registers the alert when the learner has an expiration and is not masquerading', () => {
    const { result } = renderHook(() => useRegisteredMessages(accessExpiration), { wrapper });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      code: 'clientAccessExpirationAlert',
      topic: 'outline-course-alerts',
      payload: {
        accessExpiration,
        courseId,
        org: 'edX',
        userTimezone: 'America/New_York',
        analyticsPageName: 'course_home',
      },
    });
  });

  it('registers no alert when masquerading as a learner whose access has expired', () => {
    const { result } = renderHook(
      () => useRegisteredMessages({ ...accessExpiration, masqueradingExpiredCourse: true }),
      { wrapper },
    );

    expect(result.current).toHaveLength(0);
  });
});
