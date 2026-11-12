import { getAnalyticsService, getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { type ReactElement, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';

import { useProgressTabData } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata } from '@src/courseware/data/apiHooks';
import { createTestQueryClient } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import CertificateStatus from './certificate-status/CertificateStatus';
import CompleteDonutSegment from './course-completion/CompleteDonutSegment';

// Each case renders one component on its own.

// Nothing on the progress tab loads the courseware metadata, so a case supplies it: https://github.com/openedx/frontend-app-learning/issues/2243
jest.mock('@src/courseware/data/apiHooks');

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const progressUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/progress/${courseId}`;

const WhenProgressLoads = ({ children }: { children: ReactNode }) => (
  useProgressTabData(courseId).isSuccess ? children : null
);

// Renders on the progress path with the progress data loaded and no course metadata.
const renderWithProgressData = (ui: ReactElement, tabData = {}) => {
  new MockAdapter(getAuthenticatedHttpClient()).onGet(progressUrl).reply(200, Factory.build('progressTabData', tabData));
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/course/${courseId}/progress`]}>
        <Routes>
          <Route path="/course/:courseId/progress" element={<WhenProgressLoads>{ui}</WhenProgressLoads>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  (useCoursewareMetadata as jest.Mock).mockReturnValue({ data: undefined });
});

describe('CompleteDonutSegment', () => {
  const dividers = (container: HTMLElement) => container.querySelectorAll('.divider-stroke');

  it('draws one divider, at the locked segment, when incomplete content follows it', () => {
    const { container } = render(<svg><CompleteDonutSegment completePercentage={30} lockedPercentage={20} /></svg>);

    expect(dividers(container)).toHaveLength(1);
  });

  it('draws a divider at each end when it shares the ring with the locked segment alone', () => {
    const { container } = render(<svg><CompleteDonutSegment completePercentage={50} lockedPercentage={50} /></svg>);

    expect(dividers(container)).toHaveLength(2);
  });

  it('draws no divider when rounding leaves the locked segment the whole ring', () => {
    const { container } = render(<svg><CompleteDonutSegment completePercentage={1} lockedPercentage={100} /></svg>);

    expect(dividers(container)).toHaveLength(0);
  });
});

describe('CertificateStatus', () => {
  it('renders no card and reports the status as disabled when the course metadata is not on the page', async () => {
    const { sendTrackEvent } = getAnalyticsService();
    (sendTrackEvent as jest.Mock).mockClear();
    renderWithProgressData(<><CertificateStatus /><p>loaded</p></>, { user_has_passing_grade: true });

    await screen.findByText('loaded');
    expect(screen.queryByTestId('certificate-status-component')).not.toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', expect.objectContaining({
      org_key: undefined,
      certificate_status_variant: 'certificate_status_disabled',
    }));
  });

  it('renders no card and reports the certificate status as it is when the entrance exam was not passed', async () => {
    const { sendTrackEvent } = getAnalyticsService();
    (sendTrackEvent as jest.Mock).mockClear();
    (useCoursewareMetadata as jest.Mock).mockReturnValue({ data: { entranceExamData: { entranceExamPassed: false } } });
    renderWithProgressData(<><CertificateStatus /><p>loaded</p></>, { certificate_data: { cert_status: 'unverified' } });

    await screen.findByText('loaded');
    expect(screen.queryByTestId('certificate-status-component')).not.toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', expect.objectContaining({
      certificate_status_variant: 'unverified',
    }));
  });
});
