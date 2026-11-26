import { getAnalyticsService } from '@openedx/frontend-base';
import { fireEvent, screen } from '@testing-library/react';

import { AlertList } from '@src/generic/user-messages';
import { render } from '@src/tests/render';

import useAccessExpirationAlert from './hooks';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const accessExpiration = {
  expirationDate: '2020-01-01T12:00:00Z',
  masqueradingExpiredCourse: false,
  upgradeDeadline: '2019-12-01T12:00:00Z',
  upgradeUrl: 'http://localhost/upgrade',
};

const Alerts = ({ expiration }: { expiration: typeof accessExpiration }) => {
  const alert = useAccessExpirationAlert(expiration, courseId, 'edX', 'UTC', 'outline-course-alerts', 'course_home');
  return <AlertList topic="outline-course-alerts" customAlerts={alert} />;
};

describe('AccessExpirationAlert', () => {
  it('tells an audit learner when their access expires and offers the upgrade', async () => {
    render(<Alerts expiration={accessExpiration} />);

    expect(await screen.findByText('Audit Access Expires Jan 1, 2020')).toBeInTheDocument();
    expect(screen.getByText(/You lose all access to this course, including your progress, on Jan 1, 2020\./)).toBeInTheDocument();
    expect(screen.getByText(/Upgrade by Dec 1, 2019/)).toBeInTheDocument();

    const upgradeLink = screen.getByRole('link', { name: /Upgrade now/ });
    // jsdom cannot follow the link; only the tracking is under test.
    upgradeLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(upgradeLink);
    expect(getAnalyticsService().sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: 'edX',
      courserun_key: courseId,
      linkCategory: 'FBE_banner',
      linkName: 'course_home_audit_access_expires',
      linkType: 'link',
      pageName: 'course_home',
    });
  });

  it('leaves the upgrade out once the upgrade deadline is gone', async () => {
    render(<Alerts expiration={{ ...accessExpiration, upgradeDeadline: null as unknown as string }} />);

    expect(await screen.findByText('Audit Access Expires Jan 1, 2020')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Upgrade now/ })).not.toBeInTheDocument();
  });
});
