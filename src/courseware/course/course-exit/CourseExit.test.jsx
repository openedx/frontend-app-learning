import { Factory } from 'rosie';
import {
  getAnalyticsService, getAuthenticatedHttpClient, getSiteConfig, mergeAppConfig, runPageRules,
} from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';
import {
  act, screen, waitFor, within,
} from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import { appId, coursesRole, dashboardRole } from '@src/constants';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { coursewareMetadataQuery } from '@src/courseware/data/apiHooks';
import { getCourseOutlineUrl, getCoursewareUrl } from '@src/courseware/urls';
import routes from '@src/routes';
import { mockLocation, preventNavigation } from '@src/tests/location';
import { renderRoutes } from '@src/tests/render';
import { addTestApp, removeSlotOperations } from '@src/tests/slots';

import { buildSimpleCourseBlocks } from '../../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from '../../data/__factories__/learningSequencesOutline.factory';
import { appendBrowserTimezoneToUrl } from '../../../utils';
import messages from './messages';

const { sendTrackEvent } = getAnalyticsService();

const courseExitRouteId = 'org.openedx.frontend.route.learning.courseExit';

// Shows where a redirect away from the course exit page landed.
const LandingProbe = () => <p>{`landed at ${useLocation().pathname}`}</p>;

// The route array with every page but the course exit page replaced by the probe.
const probeOtherPages = (routeList) => routeList.map((route) => {
  if (route.id === courseExitRouteId) {
    return route;
  }
  if (route.children) {
    return { ...route, children: probeOtherPages(route.children) };
  }
  return {
    ...route, lazy: undefined, loader: undefined, element: <LandingProbe />,
  };
});

describe('Course Exit Pages', () => {
  let axiosMock;
  const { lmsBaseUrl, siteName } = getSiteConfig();
  const discoveryApiBaseUrl = 'http://localhost:18381';
  const coursewareMetadata = Factory.build('courseMetadata', {
    user_has_passing_grade: true,
    end: '2014-02-05T05:00:00Z',
  });
  const courseId = coursewareMetadata.id;
  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const { courseBlocks: defaultCourseBlocks } = buildSimpleCourseBlocks(courseId, courseHomeMetadata.title);

  const courseEndPath = `/learning/course/${courseId}/course-end`;
  const coursewareMetadataUrl = appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/courseware/course/${courseId}`);
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
  const discoveryRecommendationsUrl = new RegExp(`${discoveryApiBaseUrl}/api/v1/course_recommendations/*`);
  const enrollmentsUrl = new RegExp(`${lmsBaseUrl}/api/enrollment/v2/enrollment*`);
  const goalUrl = `${lmsBaseUrl}/api/course_home/save_course_goal`;
  // One page of the paginated v2 enrollment list.
  const enrollmentsPage = (results, next = null) => ({
    count: results.length,
    num_pages: next ? 2 : 1,
    current_page: 1,
    start: 0,
    next,
    previous: null,
    results,
  });
  const learningSequencesUrlRegExp = new RegExp(`${lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`);
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const overmorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
  const localeDate = (date) => date.toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' });

  function setMetadata(coursewareAttributes, courseHomeAttributes = {}) {
    axiosMock.onGet(coursewareMetadataUrl).reply(200, { ...coursewareMetadata, ...coursewareAttributes });
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, { ...courseHomeMetadata, ...courseHomeAttributes });
  }

  // An enrolled learner, so the page shows the state that applies rather than redirecting.
  function setEnrolledMetadata(coursewareAttributes, courseHomeAttributes = {}) {
    setMetadata({ enrollment: { is_active: true }, ...coursewareAttributes }, courseHomeAttributes);
  }

  // The outline with one sequence that has not been released yet, so the course has scheduled content.
  function setScheduledContent() {
    const outline = buildOutlineFromBlocks(defaultCourseBlocks);
    const [scheduledSequenceId] = Object.keys(outline.outline.sequences);
    outline.outline.sequences[scheduledSequenceId].accessible = false;
    outline.outline.sequences[scheduledSequenceId].effective_start = tomorrow.toISOString();
    axiosMock.onGet(learningSequencesUrlRegExp).reply(200, outline);
  }

  const renderPage = (routeList = routes) => renderRoutes(routeList, courseEndPath);

  // Renders the page and waits until it has loaded and every request has settled.
  async function fetchAndRender(heading) {
    const rendered = renderPage();
    expect(await screen.findByText(heading)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    await waitFor(() => expect(rendered.queryClient.isFetching()).toBe(0));
    return rendered;
  }

  const renderCelebration = () => fetchAndRender(messages.congratulationsHeader.defaultMessage);

  // The lazy route's first load compiles the whole page, which can outlast findBy's timeout.
  beforeAll(() => import('./CourseExit'));

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(coursewareMetadataUrl).reply(200, coursewareMetadata);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onGet(discoveryRecommendationsUrl).reply(
      200,
      Factory.build('courseRecommendations', {}, { numRecs: 2 }),
    );
    axiosMock.onGet(enrollmentsUrl).reply(200, enrollmentsPage([]));
    axiosMock.onGet(learningSequencesUrlRegExp).reply(200, buildOutlineFromBlocks(defaultCourseBlocks));
    axiosMock.onPost(goalUrl).reply(200, {});

    mergeAppConfig(appId, { DISCOVERY_API_BASE_URL: discoveryApiBaseUrl });
    // The site provides the dashboard and the catalog, as an app of its own.
    addTestApp({
      routes: [
        { path: 'learner-dashboard', handle: { roles: [dashboardRole] } },
        { path: 'courses', handle: { roles: [coursesRole] } },
      ],
    });
  });

  afterEach(() => {
    act(() => {
      mergeAppConfig(appId, {
        DISCOVERY_API_BASE_URL: null,
        SUPPORT_URL: null,
        SUPPORT_URL_VERIFIED_CERTIFICATE: null,
        CREDENTIALS_BASE_URL: null,
      });
    });
    jest.clearAllMocks();
  });

  describe('when the outline is loading', () => {
    // Holds the outline request, as a slow outline would; the page's mode depends on
    // `hasScheduledContent`, which only the outline carries.
    const holdOutline = () => {
      axiosMock.onGet(learningSequencesUrlRegExp).reply(() => new Promise(() => {}));
    };

    const waitForMetadataWithOutlinePending = async ({ queryClient }) => {
      await waitFor(() => {
        expect(queryClient.getQueryState(coursewareMetadataQuery(courseId).queryKey)?.status).toBe('success');
        expect(queryClient.getQueryState(courseHomeMetaQuery(courseId).queryKey)?.status).toBe('success');
      });
      await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 0); }); });
    };

    const itWaitsForTheOutline = () => {
      it('does not redirect', async () => {
        holdOutline();
        const rendered = renderPage(probeOtherPages(routes));
        await waitForMetadataWithOutlinePending(rendered);

        expect(rendered.router.state.location.pathname).toBe(courseEndPath);
        expect(screen.queryByText(/^landed at/)).not.toBeInTheDocument();
      });

      it('does not render any course-end content', async () => {
        holdOutline();
        await waitForMetadataWithOutlinePending(renderPage());

        expect(screen.queryByText(messages.congratulationsHeader.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.endOfCourseHeader.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.courseInProgressHeader.defaultMessage)).not.toBeInTheDocument();
      });
    };

    describe('for an audit learner who is not passing and cannot view a certificate', () => {
      beforeEach(() => {
        setEnrolledMetadata(
          { user_has_passing_grade: false, certificate_data: { cert_status: 'audit_notpassing' } },
          { can_view_certificate: false },
        );
      });

      itWaitsForTheOutline();
    });

    describe('for an audit learner who is not passing and can view a certificate', () => {
      beforeEach(() => {
        setEnrolledMetadata(
          { user_has_passing_grade: false, certificate_data: { cert_status: 'audit_notpassing' } },
          { can_view_certificate: true },
        );
      });

      itWaitsForTheOutline();
    });

    describe('for a learner who is not passing, has no certificate data and cannot view a certificate', () => {
      beforeEach(() => {
        setEnrolledMetadata(
          { user_has_passing_grade: false, certificate_data: null },
          { can_view_certificate: false },
        );
      });

      itWaitsForTheOutline();
    });
  });

  describe('when the outline fails', () => {
    it('redirects to the course home', async () => {
      axiosMock.onGet(learningSequencesUrlRegExp).reply(500);
      const { router } = renderPage(probeOtherPages(routes));

      expect(await screen.findByText(`landed at ${getCourseOutlineUrl(courseId)}`)).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(getCourseOutlineUrl(courseId));
    });
  });

  describe('Course Exit routing', () => {
    it('Routes to celebration for a celebration status', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'downloadable',
          cert_web_view_url: '/certificates/cooluuidgoeshere',
        },
      });
      await renderCelebration();
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      await waitFor(() => expect(document.title).toBe(`Congratulations! | ${courseHomeMetadata.title} | ${siteName}`));
    });

    it('Routes to Non-passing experience for a learner with non-passing grade', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'unverified',
        },
        user_has_passing_grade: false,
      });
      await fetchAndRender('You’ve reached the end of the course!');
      await waitFor(() => expect(document.title).toBe(`End of Course | ${courseHomeMetadata.title} | ${siteName}`));
    });

    it('Routes to in-progress experience when the course has scheduled content', async () => {
      setEnrolledMetadata({ user_has_passing_grade: false });
      setScheduledContent();

      await fetchAndRender('More content is coming soon!');
      await waitFor(() => expect(document.title).toBe(`End of Course | ${courseHomeMetadata.title} | ${siteName}`));
    });

    it('Redirects to the course if it does not match any statuses', async () => {
      setMetadata({
        certificate_data: {
          cert_status: 'bogus_status',
        },
      });
      const { router } = renderPage(probeOtherPages(routes));

      expect(await screen.findByText(`landed at ${getCoursewareUrl(courseId)}`)).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(getCoursewareUrl(courseId));
    });

    it('reports no page-rule diagnostics', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'downloadable',
          cert_web_view_url: '/certificates/cooluuidgoeshere',
        },
      });
      await renderCelebration();
      expect(runPageRules(document)).toEqual([]);
    });
  });

  describe('Course Exit access error', () => {
    it('surfaces the 403 access detail instead of the generic error', async () => {
      axiosMock.onGet(courseHomeMetadataUrl).reply(403, { detail: 'You are not enrolled', error_code: 'not_enrolled' });
      renderPage();
      expect(await screen.findByText('You are not enrolled')).toBeInTheDocument();
    });
  });

  describe('View courses button', () => {
    beforeEach(() => {
      setEnrolledMetadata({ certificate_data: { cert_status: 'downloadable' } });
    });

    it('links to the dashboard role', async () => {
      await renderCelebration();
      expect(screen.getByRole('link', { name: 'View my courses' })).toHaveAttribute('href', '/learner-dashboard');
    });

    it('is not shown when the site provides no dashboard', async () => {
      removeSlotOperations();
      await renderCelebration();
      expect(screen.queryByRole('link', { name: 'View my courses' })).not.toBeInTheDocument();
    });
  });

  describe('Course Celebration Experience', () => {
    it('Displays webview link', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'downloadable',
          cert_web_view_url: '/certificates/cooluuidgoeshere',
        },
      });
      await renderCelebration();
      expect(screen.getByRole('link', { name: 'View my certificate' }))
        .toHaveAttribute('href', `${lmsBaseUrl}/certificates/cooluuidgoeshere`);
      expect(screen.getByRole('img', { name: 'Sample certificate' })).toBeInTheDocument();
    });

    it('logs a click on the certificate link', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'downloadable',
          cert_web_view_url: '/certificates/cooluuidgoeshere',
        },
      });
      await renderCelebration();
      const link = screen.getByRole('link', { name: 'View my certificate' });
      preventNavigation(link);
      await userEvent.click(link);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.view_cert.clicked', expect.objectContaining({
        org_key: 'edX',
        courserun_key: courseId,
      }));
    });

    it('links the dashboard and the profile in the certificate message', async () => {
      setEnrolledMetadata({ certificate_data: { cert_status: 'downloadable' } });
      await renderCelebration();
      const message = screen.getByText(/Showcase your accomplishment/);
      expect(within(message).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/learner-dashboard');
    });

    it('Displays certificate is earned but unavailable message', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'earned_but_not_available',
          certificate_available_date: '2021-05-21T12:00:00Z',
        },
      });
      await renderCelebration();
      expect(screen.getByText('Your grade and certificate status will be available soon.')).toBeInTheDocument();
    });

    it('Displays request certificate link', async () => {
      setEnrolledMetadata({ certificate_data: { cert_status: 'requesting' } });
      await renderCelebration();
      expect(screen.getByRole('button', { name: 'Request certificate' })).toBeInTheDocument();
    });

    it('requests the certificate when the request certificate link is clicked', async () => {
      setEnrolledMetadata({ certificate_data: { cert_status: 'requesting' } });
      axiosMock.onPost(new RegExp('generate_user_cert')).reply(200, {});
      await renderCelebration();
      await userEvent.click(screen.getByRole('button', { name: 'Request certificate' }));
      await waitFor(() => expect(
        axiosMock.history.post.some(req => req.url.includes('generate_user_cert')),
      ).toBe(true));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.request_cert.clicked', expect.anything());
    });

    it('Displays social share icons', async () => {
      setEnrolledMetadata({ certificate_data: { cert_status: 'unverified' }, marketing_url: 'https://edx.org' });
      await renderCelebration();
      expect(screen.getByText('Share your success on social media or email.', { exact: false })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'linkedin' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'facebook' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'email' })).toBeInTheDocument();
    });

    it('Does not display social share icons if no marketing URL', async () => {
      setEnrolledMetadata({ certificate_data: { cert_status: 'unverified' } });
      await renderCelebration();
      expect(screen.queryByRole('button', { name: 'linkedin' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'facebook' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'email' })).not.toBeInTheDocument();
    });

    it('Displays verify identity link', async () => {
      setEnrolledMetadata({
        certificate_data: { cert_status: 'unverified' },
        verify_identity_url: `${lmsBaseUrl}/verify_student/verify-now/${courseId}/`,
      });
      await renderCelebration();
      expect(screen.getByRole('link', { name: 'Verify ID now' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Sample certificate' })).not.toBeInTheDocument();
    });

    it('Displays verification pending message', async () => {
      setEnrolledMetadata({
        certificate_data: { cert_status: 'unverified' },
        verification_status: 'pending',
        verify_identity_url: `${lmsBaseUrl}/verify_student/verify-now/${courseId}/`,
      });
      await renderCelebration();
      expect(screen.getByText('Your ID verification is pending and your certificate will be available once approved.')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Verify ID now' })).not.toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Sample certificate' })).not.toBeInTheDocument();
    });

    it('Displays upgrade link when available', async () => {
      setEnrolledMetadata(
        {
          certificate_data: { cert_status: 'audit_passing' },
        },
        {
          verified_mode: {
            access_expiration_date: '9999-08-06T12:00:00Z',
            upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
            price: 600,
            currency_symbol: '€',
          },
        },
      );
      await renderCelebration();
      // Keep these text checks in sync with "audit only" test below, so it doesn't end up checking for text that is
      // never actually there, when/if the text changes.
      expect(screen.getByText('Upgrade to pursue a verified certificate')).toBeInTheDocument();
      expect(screen.getByText('For €600 you will unlock access', { exact: false })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Upgrade now' })).toBeInTheDocument();
      const node = screen.getByText('Access to this course and its materials', { exact: false });
      expect(node.textContent).toMatch(/until August 6, 9999\./);
      expect(screen.queryByRole('link', { name: 'Learn more about verified certificates' })).not.toBeInTheDocument();

      const upgradeLink = screen.getByRole('link', { name: 'upgrade now' });
      preventNavigation(upgradeLink);
      await userEvent.click(upgradeLink);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.upgrade_footnote.clicked', expect.anything());
    });

    it('Displays the discount code and the verified certificate support link', async () => {
      const supportUrl = 'https://support.example.com/verified-certificates';
      mergeAppConfig(appId, { SUPPORT_URL_VERIFIED_CERTIFICATE: supportUrl });
      setEnrolledMetadata(
        {
          certificate_data: { cert_status: 'audit_passing' },
          offer: {
            code: 'EDXWELCOME',
            discounted_price: '$135.00',
            original_price: '$150.00',
            percentage: 10,
            upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
          },
        },
        {
          verified_mode: {
            access_expiration_date: null,
            upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
            price: 150,
            currency_symbol: '$',
          },
        },
      );
      await renderCelebration();
      expect(screen.getByRole('link', { name: 'Learn more about verified certificates' }))
        .toHaveAttribute('href', supportUrl);
      expect(screen.getByText('EDXWELCOME')).toBeInTheDocument();
      expect(screen.getByText(/for 10% off!/)).toBeInTheDocument();
      // With no access deadline, the dashboard footnote replaces the upgrade footnote.
      expect(screen.getByText(/You can access this course and its materials on your/)).toBeInTheDocument();
    });

    it('Displays nothing if audit only', async () => {
      setEnrolledMetadata(
        {
          certificate_data: { cert_status: 'audit_passing' },
        },
        {
          verified_mode: null,
        },
      );
      await renderCelebration();
      // Keep these queries in sync with "upgrade link" test above, so we don't end up checking for text that is
      // never actually there, when/if the text changes.
      expect(screen.queryByText('Upgrade to pursue a verified certificate')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Upgrade now' })).not.toBeInTheDocument();
    });

    it('Displays LinkedIn Add to Profile button', async () => {
      setEnrolledMetadata({
        certificate_data: {
          cert_status: 'downloadable',
          cert_web_view_url: '/certificates/cooluuidgoeshere',
        },
        linkedin_add_to_profile_url: 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&params',
      });
      await renderCelebration();
      expect(screen.getByRole('link', { name: 'View my certificate' })).toBeInTheDocument();
      const linkedinLink = screen.getByRole('link', { name: 'Add to LinkedIn profile' });
      preventNavigation(linkedinLink);
      await userEvent.click(linkedinLink);
      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.course_exit.linkedin_add_to_profile.clicked',
        expect.anything(),
      );
    });

    describe('Dashboard footnote', () => {
      beforeEach(() => {
        setEnrolledMetadata({ certificate_data: { cert_status: 'downloadable' } });
      });

      it('links to the dashboard role and logs the click with the variant', async () => {
        await renderCelebration();
        const footnote = screen.getByText(/You can access this course and its materials on your/);
        const link = within(footnote).getByRole('link', { name: 'Dashboard' });
        expect(link).toHaveAttribute('href', '/learner-dashboard');
        preventNavigation(link);
        await userEvent.click(link);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.dashboard_footnote.clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          variant: 'celebration_with_cert',
        });
      });

      it('has no link when the site provides no dashboard', async () => {
        removeSlotOperations();
        await renderCelebration();
        const footnote = screen.getByText(/You can access this course and its materials on your/);
        expect(within(footnote).queryByRole('link')).not.toBeInTheDocument();
      });
    });

    describe('Program Completion experience', () => {
      const program = (slug, progress) => ({
        progress,
        slug,
        title: 'Example Program',
        uuid: '123456',
        url: 'http://localhost:18000/dashboard/programs/123456',
      });
      const complete = { completed: 3, in_progress: 0, not_started: 0 };
      const setPrograms = (relatedPrograms) => setEnrolledMetadata({
        certificate_data: {
          cert_status: 'downloadable',
          cert_web_view_url: '/certificates/cooluuidgoeshere',
        },
        related_programs: relatedPrograms,
      });

      it('Does not render ProgramCompletion no related programs', async () => {
        setPrograms(null);
        await renderCelebration();
        expect(screen.queryByTestId('program-completion')).not.toBeInTheDocument();
      });

      it('Does not render ProgramCompletion if program is incomplete', async () => {
        setPrograms([program('micromasters', { completed: 1, in_progress: 1, not_started: 1 })]);
        await renderCelebration();

        expect(screen.queryByTestId('program-completion')).not.toBeInTheDocument();
      });

      it('Renders ProgramCompletion if program is complete', async () => {
        mergeAppConfig(appId, { SUPPORT_URL: 'https://support.example.com' });
        setPrograms([program('micromasters', complete)]);
        await renderCelebration();

        expect(screen.getByTestId('program-completion')).toBeInTheDocument();
        expect(screen.getByTestId('micromasters')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /MicroMasters certificates to Master’s degrees/ }))
          .toHaveAttribute('href', expect.stringMatching(/^https:\/\/support\.example\.com\/hc\/en-us\/articles\//));
      });

      it('links a complete MicroBachelors program to support and to the learner records', async () => {
        mergeAppConfig(appId, {
          SUPPORT_URL: 'https://support.example.com',
          CREDENTIALS_BASE_URL: 'https://credentials.example.com',
        });
        setPrograms([program('microbachelors', complete)]);
        await renderCelebration();

        expect(screen.getByTestId('microbachelors')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /MicroBachelors credential/ }))
          .toHaveAttribute('href', 'https://support.example.com/hc/en-us/articles/360004623154');
        expect(screen.getByRole('link', { name: 'Apply for credit' }))
          .toHaveAttribute('href', 'https://credentials.example.com/records');
      });

      it('Does not render ProgramCompletion if program is an excluded type', async () => {
        setPrograms([program('excluded-program-type', complete)]);
        await renderCelebration();

        expect(screen.queryByTestId('program-completion')).not.toBeInTheDocument();
        expect(screen.queryByTestId('excluded-program-type')).not.toBeInTheDocument();
      });
    });

    describe('Course recommendations', () => {
      beforeEach(() => {
        setEnrolledMetadata({ certificate_data: { cert_status: 'downloadable' } });
      });

      it('Displays recommendations if at least two are available', async () => {
        await renderCelebration();
        const recommendationsTable = await screen.findByTestId('course-recommendations');
        expect(recommendationsTable).toBeInTheDocument();
        expect(screen.queryByTestId('catalog-suggestion')).not.toBeInTheDocument();
        expect(within(recommendationsTable).getByRole('link', { name: 'Explore more courses' }))
          .toHaveAttribute('href', '/courses');
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.recommendations.viewed', {
          course_key: 'edX+DemoX',
          recommendations_status: 'loaded',
          recommendations_length: 2,
        });
      });

      it('goes to a recommended course when its card is clicked', async () => {
        await renderCelebration();
        const [firstCard] = await screen.findAllByRole('group', { name: 'DemoX' });
        const location = mockLocation({ href: 'http://localhost/' });
        await userEvent.click(within(firstCard).getByRole('link'));

        expect(sendTrackEvent).toHaveBeenCalledWith(
          'edx.ui.lms.course_exit.recommendation_discovery_card.clicked',
          expect.anything(),
        );
        await waitFor(() => expect(location.href).toMatch(/^https:\/\/www\.edx\.org\/course\//));
      });

      it('Displays the generic catalog suggestion if fewer than two recommendations are available', async () => {
        axiosMock.onGet(discoveryRecommendationsUrl).reply(
          200,
          Factory.build('courseRecommendations', {}, { numRecs: 1 }),
        );
        await renderCelebration();
        const catalogSuggestion = await screen.findByTestId('catalog-suggestion');
        expect(catalogSuggestion).toBeInTheDocument();
        expect(screen.queryByTestId('course-recommendations')).not.toBeInTheDocument();
      });

      it('Displays the catalog suggestion when the recommendations fail to load', async () => {
        axiosMock.onGet(discoveryRecommendationsUrl).reply(500);
        await renderCelebration();
        expect(await screen.findByTestId('catalog-suggestion')).toBeInTheDocument();
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.recommendations.viewed', expect.objectContaining({
          recommendations_status: 'failed',
        }));
      });

      it('Displays the catalog suggestion when no discovery service is configured', async () => {
        mergeAppConfig(appId, { DISCOVERY_API_BASE_URL: null });
        await renderCelebration();
        expect(await screen.findByTestId('catalog-suggestion')).toBeInTheDocument();
        expect(axiosMock.history.get.some(({ url }) => discoveryRecommendationsUrl.test(String(url)))).toBe(false);
      });

      it('Will not recommend a course in which the user is already enrolled', async () => {
        const initialRecommendations = Factory.build('courseRecommendations', {}, { numRecs: 2 });
        initialRecommendations.recommendations.push(
          Factory.build('courseRecommendation', { key: 'edX+EnrolledX', title: 'Already Enrolled' }),
        );
        initialRecommendations.recommendations.push(
          Factory.build('courseRecommendation', { key: 'edX+NotEnrolledX', title: 'Not Already Enrolled' }),
        );
        axiosMock.onGet(discoveryRecommendationsUrl).reply(200, initialRecommendations);
        axiosMock.onGet(enrollmentsUrl).reply(200, enrollmentsPage([
          Factory.build(
            'userEnrollment',
            '',
            {
              runKey: 'edX+EnrolledX+1T2021',
            },
          ),
        ]));
        await renderCelebration();
        const recommendationsTable = await screen.findByTestId('course-recommendations');
        expect(recommendationsTable).toBeInTheDocument();
        expect(screen.queryByText('Already Enrolled')).not.toBeInTheDocument();
        expect(screen.queryByText('Not Already Enrolled')).toBeInTheDocument();
      });

      it('Will not recommend a course in which the user is enrolled on a later page of enrollments', async () => {
        const initialRecommendations = Factory.build('courseRecommendations', {}, { numRecs: 2 });
        initialRecommendations.recommendations.push(
          Factory.build('courseRecommendation', { key: 'edX+EnrolledX', title: 'Already Enrolled' }),
        );
        initialRecommendations.recommendations.push(
          Factory.build('courseRecommendation', { key: 'edX+NotEnrolledX', title: 'Not Already Enrolled' }),
        );
        axiosMock.onGet(discoveryRecommendationsUrl).reply(200, initialRecommendations);
        const secondPageUrl = `${lmsBaseUrl}/api/enrollment/v2/enrollment/?page=2&page_size=100`;
        axiosMock.onGet(enrollmentsUrl).reply((config) => (
          String(config.url) === secondPageUrl
            ? [200, enrollmentsPage([Factory.build('userEnrollment', '', { runKey: 'edX+EnrolledX+1T2021' })])]
            : [200, enrollmentsPage([Factory.build('userEnrollment', '', { runKey: 'edX+OtherX+1T2021' })], secondPageUrl)]
        ));
        await renderCelebration();
        const recommendationsTable = await screen.findByTestId('course-recommendations');
        expect(recommendationsTable).toBeInTheDocument();
        expect(screen.queryByText('Already Enrolled')).not.toBeInTheDocument();
        expect(screen.queryByText('Not Already Enrolled')).toBeInTheDocument();
        const enrollmentRequestUrls = axiosMock.history.get
          .map(({ url }) => String(url))
          .filter((url) => enrollmentsUrl.test(url));
        expect(enrollmentRequestUrls).toEqual([
          `${lmsBaseUrl}/api/enrollment/v2/enrollment/?page_size=100`,
          secondPageUrl,
        ]);
      });

      it('Will not recommend a course in which the user has an inactive enrollment', async () => {
        const initialRecommendations = Factory.build('courseRecommendations', {}, { numRecs: 2 });
        initialRecommendations.recommendations.push(
          Factory.build('courseRecommendation', { key: 'edX+UnenrolledX', title: 'Unenrolled' }),
        );
        axiosMock.onGet(discoveryRecommendationsUrl).reply(200, initialRecommendations);
        axiosMock.onGet(enrollmentsUrl).reply(200, enrollmentsPage([
          Factory.build('userEnrollment', { is_active: false }, { runKey: 'edX+UnenrolledX+1T2021' }),
        ]));
        await renderCelebration();
        const recommendationsTable = await screen.findByTestId('course-recommendations');
        expect(recommendationsTable).toBeInTheDocument();
        expect(screen.queryByText('Unenrolled')).not.toBeInTheDocument();
      });

      it('Will not recommend the same course that the user just finished', async () => {
        // the uuid returned from the call to discovery is the uuid of the current course
        const initialRecommendations = Factory.build(
          'courseRecommendations',
          { uuid: 'my_uuid' },
          { numRecs: 2 },
        );
        initialRecommendations.recommendations.push(
          Factory.build('courseRecommendation', { uuid: 'my_uuid', title: 'Same Course' }),
        );
        axiosMock.onGet(discoveryRecommendationsUrl).reply(200, initialRecommendations);
        await renderCelebration();
        const recommendationsTable = await screen.findByTestId('course-recommendations');
        expect(recommendationsTable).toBeInTheDocument();
        expect(screen.queryByText('Same Course')).not.toBeInTheDocument();
      });
    });

    it('Shows not available messaging before certificates are available to nonpassing learners when theres no certificate data', async () => {
      setEnrolledMetadata({
        end: tomorrow.toISOString(),
        user_has_passing_grade: false,
        certificate_data: undefined,
      }, {
        can_view_certificate: false,
      });
      await renderCelebration();
      expect(screen.getByText(`Final grades and any earned certificates are scheduled to be available after ${localeDate(tomorrow)}.`)).toBeInTheDocument();
    });

    it('Shows not available messaging before certificates are available to passing learners when theres no certificate data', async () => {
      setEnrolledMetadata({
        end: tomorrow.toISOString(),
        user_has_passing_grade: true,
        certificate_data: undefined,
      }, {
        can_view_certificate: false,
      });
      await renderCelebration();
      expect(screen.getByText(`Final grades and any earned certificates are scheduled to be available after ${localeDate(tomorrow)}.`)).toBeInTheDocument();
    });

    it('Shows certificate_available_date if learner is passing', async () => {
      setEnrolledMetadata({
        end: tomorrow.toISOString(),
        user_has_passing_grade: true,
        certificate_data: {
          cert_status: 'earned_but_not_available',
          certificate_available_date: overmorrow.toISOString(),
        },
      }, {
        can_view_certificate: false,
      });

      await renderCelebration();
      expect(screen.getByText('Your grade and certificate status will be available soon.')).toBeInTheDocument();
      expect(screen.getByText(localeDate(overmorrow), { exact: false })).toBeInTheDocument();
    });
  });

  describe('Course Non-passing Experience', () => {
    beforeEach(() => {
      setEnrolledMetadata({ user_has_passing_grade: false });
    });

    it('Displays link to progress tab', async () => {
      await fetchAndRender('You’ve reached the end of the course!');
      const link = screen.getByRole('link', { name: 'View grades' });
      expect(link).toHaveAttribute('href', `/learning/course/${courseId}/progress`);
      // The progress role is Learning's own, so the link stays in the router.
      preventNavigation(link);
      await userEvent.click(link);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.view_grades.clicked', expect.anything());
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.visited', expect.objectContaining({
        variant: 'nonpassing',
      }));
    });

    it('suggests the catalog and logs a click on it', async () => {
      await fetchAndRender('You’ve reached the end of the course!');
      const link = within(screen.getByTestId('catalog-suggestion')).getByRole('link', { name: 'Search our catalog' });
      expect(link).toHaveAttribute('href', '/courses');
      preventNavigation(link);
      await userEvent.click(link);
      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.ui.lms.course_exit.catalog_search.clicked',
        expect.objectContaining({ variant: 'nonpassing' }),
      );
    });

    it('suggests no catalog when the site provides none', async () => {
      removeSlotOperations();
      await fetchAndRender('You’ve reached the end of the course!');
      expect(screen.queryByTestId('catalog-suggestion')).not.toBeInTheDocument();
    });

    it('has no grades link when the course has no progress tab', async () => {
      setEnrolledMetadata(
        { user_has_passing_grade: false },
        { tabs: courseHomeMetadata.tabs.filter(({ tab_id: tabId }) => tabId !== 'progress') },
      );
      await fetchAndRender('You’ve reached the end of the course!');
      expect(screen.queryByRole('link', { name: 'View grades' })).not.toBeInTheDocument();
    });
  });

  describe('Course in progress experience', () => {
    it('Displays link to dates tab', async () => {
      setEnrolledMetadata({ user_has_passing_grade: false });
      setScheduledContent();

      await fetchAndRender('More content is coming soon!');
      const link = screen.getByRole('link', { name: 'View course schedule' });
      expect(link).toHaveAttribute('href', `/learning/course/${courseId}/dates`);
      preventNavigation(link);
      await userEvent.click(link);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_exit.view_dates_tab.clicked', expect.anything());
    });
  });

  it('unsubscribes the user when loading the course exit page', async () => {
    setEnrolledMetadata({
      enrollment: {
        is_active: true,
        mode: 'audit',
      },
      certificate_data: { cert_status: 'audit_passing' },
    }, { verified_mode: null });
    await renderCelebration();
    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toMatch(goalUrl);
      expect(axiosMock.history.post[0].data).toMatch(`{"course_id":"${courseId}","subscribed_to_reminders":false}`);
    });
  });

  it('does not unsubscribe a staff member masquerading as an audit learner', async () => {
    setEnrolledMetadata({
      enrollment: {
        is_active: true,
        mode: 'audit',
      },
      certificate_data: { cert_status: 'audit_passing' },
    }, { verified_mode: null, original_user_is_staff: true, is_staff: false });
    await renderCelebration();
    expect(axiosMock.history.post.filter(({ url }) => url.includes('save_course_goal'))).toHaveLength(0);
  });

  // The celebration page and the readers under it are on the page being counted.
  const loadCelebrationPage = async () => {
    setEnrolledMetadata({
      certificate_data: {
        cert_status: 'downloadable',
        cert_web_view_url: '/certificates/cooluuidgoeshere',
      },
    });
    await renderCelebration();
  };

  it('requests the course metadata once per load', async () => {
    await loadCelebrationPage();

    expect(axiosMock.history.get.filter((req) => req.url === courseHomeMetadataUrl)).toHaveLength(1);
  });

  it('requests the courseware metadata once per load', async () => {
    await loadCelebrationPage();

    expect(axiosMock.history.get.filter((req) => req.url === coursewareMetadataUrl)).toHaveLength(1);
  });

  it('requests the learning-sequences outline once per load', async () => {
    await loadCelebrationPage();

    const outlineUrl = new URL(`${lmsBaseUrl}/api/learning_sequences/v1/course_outline/${courseId}`).href;
    expect(axiosMock.history.get.filter((req) => req.url === outlineUrl)).toHaveLength(1);
  });

  it('requests the recommendations once per load', async () => {
    await loadCelebrationPage();
    await screen.findByTestId('course-recommendations');

    expect(axiosMock.history.get.filter((req) => discoveryRecommendationsUrl.test(String(req.url)))).toHaveLength(1);
  });
});
