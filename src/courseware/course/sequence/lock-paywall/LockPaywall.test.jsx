import { Factory } from 'rosie';
import { getAnalyticsService } from '@openedx/frontend-base';
import { fireEvent, screen } from '@testing-library/react';

import { mockCourseRequests, renderInCourseware } from '@src/tests/courseware';
import { preventNavigation } from '@src/tests/location';
import { SidebarProvider } from '../../sidebar/SidebarContext';
import LockPaywall from './LockPaywall';

const { sendTrackEvent } = getAnalyticsService();

describe('Lock Paywall', () => {
  let sequenceId;
  let defaultCourseHomeMetadata;
  const mockData = {};

  beforeEach(() => {
    ({ courseId: mockData.courseId, sequenceId, courseHomeMetadata: defaultCourseHomeMetadata } = mockCourseRequests());
  });

  const renderPaywall = (props) => renderInCourseware(
    <SidebarProvider courseId={props.courseId} unitId={null} widgets={[]}>
      <LockPaywall {...props} />
    </SidebarProvider>,
    { courseId: props.courseId, sequenceId },
  );

  it('displays unlock link with price', async () => {
    const {
      currency_symbol: currencySymbol,
      price,
      upgrade_url: upgradeUrl,
    } = defaultCourseHomeMetadata.verified_mode;
    renderPaywall(mockData);

    const upgradeLink = await screen.findByRole('link', { name: `Upgrade for ${currencySymbol}${price}` });
    expect(upgradeLink).toHaveAttribute('href', `${upgradeUrl}`);
  });

  it('displays discounted price if there is an offer/first time purchase', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      offer: {
        code: 'EDXWELCOME',
        expiration_date: '2070-01-01T12:00:00Z',
        original_price: '$100',
        discounted_price: '$85',
        percentage: 15,
        upgrade_url: 'https://example.com/upgrade',
      },
    });
    mockCourseRequests({ courseMetadata });
    renderPaywall({ ...mockData, courseId: courseMetadata.id });

    expect((await screen.findByText(/Upgrade for/)).textContent).toMatch('$85 ($100)');
  });

  it('sends analytics event onClick of unlock link', async () => {
    sendTrackEvent.mockClear();

    mockCourseRequests();
    const {
      currency_symbol: currencySymbol,
      price,
    } = defaultCourseHomeMetadata.verified_mode;
    renderPaywall(mockData);

    const upgradeLink = await screen.findByRole('link', { name: `Upgrade for ${currencySymbol}${price}` });
    preventNavigation(upgradeLink);
    fireEvent.click(upgradeLink);

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: 'edX',
      courserun_key: mockData.courseId,
      linkCategory: '(none)',
      linkName: 'in_course_upgrade',
      linkType: 'link',
      pageName: 'in_course',
    });
  });

  it('does not display anything if course does not have verified mode', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { verified_mode: null });
    mockCourseRequests({ courseHomeMetadata });
    renderPaywall({ ...mockData, courseId: courseHomeMetadata.id });
    await screen.findByTestId('course-query-gate-open');

    expect(screen.queryByTestId('lock-paywall-test-id')).not.toBeInTheDocument();
  });

  it('displays past expiration message if expiration date has expired', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      access_expiration: {
        expiration_date: '1995-02-22T05:00:00Z',
      },
      marketing_url: 'https://example.com/course-details',
    });
    mockCourseRequests({ courseMetadata });
    renderPaywall({ ...mockData, courseId: courseMetadata.id });
    expect(await screen.findByText('The upgrade deadline for this course passed. To upgrade, enroll in the next available session.')).toBeInTheDocument();
    expect(screen.getByText('View Course Details'))
      .toHaveAttribute('href', 'https://example.com/course-details');
  });

  it('sends analytics event onClick of past expiration course details link', async () => {
    sendTrackEvent.mockClear();
    const courseMetadata = Factory.build('courseMetadata', {
      access_expiration: {
        expiration_date: '1995-02-22T05:00:00Z',
      },
      marketing_url: 'https://example.com/course-details',
    });
    mockCourseRequests({ courseMetadata });
    renderPaywall({ ...mockData, courseId: courseMetadata.id });
    const courseDetailsLink = await screen.findByText('View Course Details');
    preventNavigation(courseDetailsLink);
    fireEvent.click(courseDetailsLink);

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.gated_content.past_expiration.link_clicked', {
      org_key: 'edX',
      courserun_key: mockData.courseId,
      linkCategory: 'gated_content',
      linkName: 'course_details',
      linkType: 'link',
      pageName: 'in_course',
    });
  });
});
