import React from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  render, screen, fireEvent, initializeMockApp, initializeTestStore,
} from '../../setupTest';
import CourseSock from './CourseSock';

jest.mock('@edx/frontend-platform/analytics');

describe('Course Sock', () => {
  let store;
  const mockData = {
    verifiedMode: {
      upgradeUrl: 'test-url',
      price: 1234,
      currency: 'dollars',
      currencySymbol: '$',
    },
    pageLocation: 'Course Content Page',
  };

  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
    store = await initializeTestStore();
    const { courseware } = store.getState();
    mockData.courseId = courseware.courseId;
  });

  it('hides upsell information on load', () => {
    render(<CourseSock {...mockData} />);

    expect(screen.getByRole('button', { name: 'Learn About Verified Certificates' })).toBeInTheDocument();
    expect(screen.queryByText('edX Verified Certificate')).not.toBeInTheDocument();
  });

  it.only('handles click', () => {
    sendTrackEvent.mockClear();
    render(<CourseSock {...mockData} />);
    const learnMoreButton = screen.getByRole('button', { name: 'Learn About Verified Certificates' });
    fireEvent.click(learnMoreButton);

    expect(screen.getByText('edX Verified Certificate')).toBeInTheDocument();
    const { currencySymbol, price } = mockData.verifiedMode;
    const upsellButton = screen.getByText(`Upgrade for ${currencySymbol}${price}`);
    expect(upsellButton).toBeInTheDocument();
    fireEvent.click(upsellButton);
    expect(sendTrackEvent).toHaveBeenCalledTimes(4);

    expect(sendTrackEvent).toHaveBeenCalledWith('Promotion Viewed', {
      courserun_key: 'course-v1:edX+DemoX+Demo_Course_1',
      creative: 'original_sock',
      name: 'In-Course Verification Prompt',
      org_key: null,
      position: 'sock',
      promotion_id: 'courseware_verified_certificate_upsell',
    });
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.course.sock.toggle_closed', {
      courserun_key: 'course-v1:edX+DemoX+Demo_Course_1',
      from_page: 'Course Content Page',
      org_key: null,
    });
    expect(sendTrackEvent).toHaveBeenCalledWith('Promotion Clicked', {
      courserun_key: 'course-v1:edX+DemoX+Demo_Course_1',
      creative: 'original_sock',
      name: 'In-Course Verification Prompt',
      org_key: null,
      position: 'sock',
      promotion_id: 'courseware_verified_certificate_upsell',
    });
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: null,
      courserun_key: mockData.courseId,
      linkCategory: 'green_upgrade',
      linkName: 'in_course_sock',
      linkType: 'button',
      pageName: 'in_course',
    });
    fireEvent.click(learnMoreButton);
    expect(screen.queryByText('edX Verified Certificate')).not.toBeInTheDocument();
  });
});
