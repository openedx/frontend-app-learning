import { render } from '@testing-library/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ChatTrigger from './ChatTrigger';
import { act, fireEvent, screen } from '../../../setupTest';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ userId: 1 })),
}));
jest.mock('@edx/frontend-platform/analytics');

describe('ChatTrigger', () => {
  it('handles click to open/close chat modal', async () => {
    sendTrackEvent.mockClear();
    render(
      <IntlProvider>
        <BrowserRouter>
          <ChatTrigger
            enrollmentMode={null}
            isStaff
            launchUrl="https://testurl.org"
            courseId="course-edX"
          />
        </BrowserRouter>,
      </IntlProvider>,
    );

    const chatTrigger = screen.getByRole('button', { name: /Show chat modal/i });
    expect(chatTrigger).toBeInTheDocument();
    expect(screen.queryByText('Need help understanding course content?')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(chatTrigger);
    });
    const modalCloseButton = screen.getByRole('button', { name: /Close/i });
    await expect(modalCloseButton).toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.lti_modal.opened', {
      course_id: 'course-edX',
      user_id: 1,
      is_staff: true,
    });

    await act(async () => {
      fireEvent.click(modalCloseButton);
    });
    await expect(modalCloseButton).not.toBeInTheDocument();
    expect(screen.queryByText('Need help understanding course content?')).not.toBeInTheDocument();
  });

  const testCases = [
    { enrollmentMode: null, isVisible: false },
    { enrollmentMode: undefined, isVisible: false },
    { enrollmentMode: 'audit', isVisible: false },
    { enrollmentMode: 'xyz', isVisible: false },
    { enrollmentMode: 'professional', isVisible: true },
    { enrollmentMode: 'verified', isVisible: true },
    { enrollmentMode: 'no-id-professional', isVisible: true },
    { enrollmentMode: 'credit', isVisible: true },
    { enrollmentMode: 'masters', isVisible: true },
    { enrollmentMode: 'executive-education', isVisible: true },
  ];

  testCases.forEach(test => {
    it(`does chat to be visible based on enrollment mode of ${test.enrollmentMode}`, async () => {
      render(
        <IntlProvider>
          <BrowserRouter>
            <ChatTrigger
              enrollmentMode={test.enrollmentMode}
              isStaff={false}
              launchUrl="https://testurl.org"
            />
          </BrowserRouter>,
        </IntlProvider>,
      );

      const chatTrigger = screen.queryByRole('button', { name: /Show chat modal/i });
      if (test.isVisible) {
        expect(chatTrigger).toBeInTheDocument();
      } else {
        expect(chatTrigger).not.toBeInTheDocument();
      }
    });
  });
});
