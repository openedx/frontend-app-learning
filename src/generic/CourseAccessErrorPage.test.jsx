import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import { getAuthenticatedHttpClient, getSiteConfig, runPageRules } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';

import routes from '@src/routes';
import { renderRoutes } from '@src/tests/render';

describe('CourseAccessErrorPage', () => {
  let axiosMock;
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const metadataUrl = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/`);
  const accessDeniedPath = `/learning/course/${courseId}/access-denied`;
  const renderPage = () => renderRoutes(routes, accessDeniedPath);

  const setCourseAccess = (courseAccess) => {
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseHomeMetadata', {
      course_access: {
        additional_context_user_message: null,
        developer_message: null,
        error_code: null,
        has_access: true,
        user_fragment: null,
        user_message: null,
        ...courseAccess,
      },
    }));
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('displays loading while the metadata query is pending', async () => {
    axiosMock.onGet(metadataUrl).reply(() => new Promise(() => {}));
    const { router } = renderPage();
    expect(await screen.findByText('Loading course page…')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(accessDeniedPath);
  });

  it('sends a learner who has access, through the course home redirect, to the course home', async () => {
    setCourseAccess({ has_access: true });
    axiosMock.onGet(new RegExp(`${getSiteConfig().lmsBaseUrl}/api/course_home/outline/`)).reply(200, Factory.build('outlineTabData'));
    const { router } = renderPage();
    const pathnames = [];
    router.subscribe(({ navigation }) => {
      if (navigation.location) {
        pathnames.push(navigation.location.pathname);
      }
    });
    await waitFor(() => expect(router.state.location.pathname).toBe(`/learning/course/${courseId}/home`));
    expect(pathnames[0]).toBe(`/learning/redirect/home/${courseId}`);
    expect(await screen.findByRole('heading', { name: 'Demonstration Course' })).toBeInTheDocument();
    // The course home shows a not-enrolled learner an alert it loads lazily: wait for it before the test ends.
    expect(await screen.findByTestId('private-course-alert')).toBeInTheDocument();
  });

  describe('when the learner is under the wrong enterprise', () => {
    beforeEach(() => {
      setCourseAccess({
        has_access: false,
        error_code: 'incorrect_active_enterprise',
        user_message: 'You are not enrolled through this enterprise.',
      });
    });

    it("renders the LMS's message and the link to switch enterprise and return to the course home", async () => {
      const { router } = renderPage();
      expect(await screen.findByText('You are not enrolled through this enterprise.', { exact: false })).toBeInTheDocument();
      const successUrl = encodeURIComponent(`http://localhost/learning/course/${courseId}/home`);
      expect(screen.getByRole('link', { name: 'change enterprise now' })).toHaveAttribute(
        'href',
        `${getSiteConfig().lmsBaseUrl}/enterprise/select/active/?success_url=${successUrl}`,
      );
      expect(screen.getByTestId('access-denied-main')).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(accessDeniedPath);
    });

    it('reports no page-rule diagnostics', async () => {
      renderPage();
      await screen.findByRole('link', { name: 'change enterprise now' });
      expect(runPageRules(document)).toEqual([]);
    });
  });

  it('renders the page with no alert for any other denial', async () => {
    setCourseAccess({ has_access: false, error_code: 'audit_expired' });
    const { router } = renderPage();
    expect(await screen.findByTestId('access-denied-main')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe(accessDeniedPath);
  });

  it('renders the page with no alert when the metadata query fails', async () => {
    axiosMock.onGet(metadataUrl).reply(404);
    renderPage();
    expect(await screen.findByTestId('access-denied-main')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
