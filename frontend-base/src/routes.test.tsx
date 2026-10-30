import { runPageRules } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import routes from '@src/routes';
import { renderRoutes } from '@src/tests/render';

const courseId = 'course-v1:OpenedX+DemoX+DemoCourse';

const renderAt = (path: string) => renderRoutes(routes, `/learning${path}`);
const expectStub = async (page: string, params: Record<string, string>) => {
  expect(await screen.findByText(`${page}: not yet ported`)).toBeInTheDocument();
  Object.entries(params).forEach(([name, value]) => {
    expect(screen.getByText(`${name}=${value}`)).toBeInTheDocument();
  });
};

describe('routes', () => {
  describe('outline', () => {
    it('renders at course/:courseId/home', async () => {
      renderAt(`/course/${courseId}/home`);
      await expectStub('outline', { courseId });
    });
  });

  describe('progress', () => {
    it('renders at course/:courseId/progress', async () => {
      renderAt(`/course/${courseId}/progress`);
      await expectStub('progress', { courseId });
    });

    it('renders at course/:courseId/progress/:targetUserId with the target user', async () => {
      renderAt(`/course/${courseId}/progress/42`);
      await expectStub('progress', { courseId, targetUserId: '42' });
    });
  });

  describe('discussion', () => {
    it('renders at course/:courseId/discussion/:path/* with the path and the rest', async () => {
      renderAt(`/course/${courseId}/discussion/topics/abc`);
      await expectStub('discussion', { courseId, path: 'topics', '*': 'abc' });
    });
  });

  describe('live', () => {
    it('renders at course/:courseId/live', async () => {
      renderAt(`/course/${courseId}/live`);
      await expectStub('live', { courseId });
    });
  });

  describe('courseware', () => {
    it('renders at course/:courseId', async () => {
      renderAt(`/course/${courseId}`);
      await expectStub('courseware', { courseId });
    });

    it('renders at course/:courseId/:sequenceId with the sequence', async () => {
      renderAt(`/course/${courseId}/seq`);
      await expectStub('courseware', { courseId, sequenceId: 'seq' });
    });

    it('renders at course/:courseId/:sequenceId/:unitId with both ids', async () => {
      renderAt(`/course/${courseId}/seq/unit`);
      await expectStub('courseware', { courseId, sequenceId: 'seq', unitId: 'unit' });
    });

    it('renders at preview/course/:courseId/:sequenceId with the sequence', async () => {
      renderAt(`/preview/course/${courseId}/seq`);
      await expectStub('courseware', { courseId, sequenceId: 'seq' });
    });

    it('renders at preview/course/:courseId/:sequenceId/:unitId with both ids', async () => {
      renderAt(`/preview/course/${courseId}/seq/unit`);
      await expectStub('courseware', { courseId, sequenceId: 'seq', unitId: 'unit' });
    });
  });

  describe('courseExit', () => {
    it('renders at course/:courseId/course-end', async () => {
      renderAt(`/course/${courseId}/course-end`);
      await expectStub('courseExit', { courseId });
    });
  });

  describe('accessDenied', () => {
    it('renders at course/:courseId/access-denied', async () => {
      renderAt(`/course/${courseId}/access-denied`);
      await expectStub('accessDenied', { courseId });
    });
  });

  describe('goalUnsubscribe', () => {
    it('renders at goal-unsubscribe/:token with the token', async () => {
      renderAt('/goal-unsubscribe/tok');
      await expectStub('goalUnsubscribe', { token: 'tok' });
    });
  });

  describe('redirect', () => {
    it('renders at redirect/* with the rest', async () => {
      renderAt('/redirect/dashboard');
      await expectStub('redirect', { '*': 'dashboard' });
    });
  });

  describe('preferencesUnsubscribe', () => {
    it('renders at preferences-unsubscribe/:userToken with the token', async () => {
      renderAt('/preferences-unsubscribe/tok');
      await expectStub('preferencesUnsubscribe', { userToken: 'tok' });
    });

    it('renders at preferences-unsubscribe/:userToken/:updatePatch with the patch', async () => {
      renderAt('/preferences-unsubscribe/tok/patch');
      await expectStub('preferencesUnsubscribe', { userToken: 'tok', updatePatch: 'patch' });
    });
  });

  describe('page rules', () => {
    it.each([
      `/course/${courseId}/home`,
      `/course/${courseId}/progress`,
      `/course/${courseId}/progress/42`,
      `/course/${courseId}/discussion/topics/abc`,
      `/course/${courseId}/live`,
      `/course/${courseId}`,
      `/course/${courseId}/seq`,
      `/course/${courseId}/seq/unit`,
      `/preview/course/${courseId}/seq`,
      `/preview/course/${courseId}/seq/unit`,
      `/course/${courseId}/course-end`,
      `/course/${courseId}/access-denied`,
      '/goal-unsubscribe/tok',
      '/redirect/dashboard',
      '/preferences-unsubscribe/tok',
      '/preferences-unsubscribe/tok/patch',
    ])('reports no page-rule diagnostics at %s', async (path) => {
      renderAt(path);
      await screen.findByText(/: not yet ported$/);
      expect(runPageRules(document)).toEqual([]);
    });
  });
});
