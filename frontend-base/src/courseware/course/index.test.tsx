import { getAuthenticatedHttpClient, getSiteConfig, runPageRules } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import routes from '@src/routes';
import { buildSimpleCourseBlocks } from '@src/shared/data/__factories__/courseBlocks.factory';
import { renderRoutes } from '@src/tests/render';
import { buildOutlineFromBlocks } from '../data/__factories__/learningSequencesOutline.factory';

// The container's own suite replaces this stub with a fake unit, so these cases render it through the routes.
describe('the course stub', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const { courseBlocks, sequenceBlocks, unitBlocks } = buildSimpleCourseBlocks(courseId, 'Demonstration Course');
  const [sequenceBlock] = sequenceBlocks;
  const [unitBlock] = unitBlocks;
  const lmsBaseUrl = getSiteConfig().lmsBaseUrl;

  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('..')]));

  beforeEach(() => {
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/courseware/course/*`)).reply(200, Factory.build('courseMetadata'));
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/course_home/course_metadata/*`))
      .reply(200, Factory.build('courseHomeMetadata'));
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`))
      .reply(200, buildOutlineFromBlocks(courseBlocks));
    axiosMock.onGet(`${lmsBaseUrl}/api/courseware/sequence/${sequenceBlock.id}`)
      .reply(200, Factory.build('sequenceMetadata', {}, { courseId, sequenceBlock, unitBlocks }));

    renderRoutes(routes, `/learning/course/${courseId}/${sequenceBlock.id}/${unitBlock.id}`);
  });

  it('prints the course, sequence and unit ids the container gives it', async () => {
    const stub = await screen.findByRole('main');

    expect(stub).toHaveTextContent('course: not yet ported');
    expect(stub).toHaveTextContent(`courseId=${courseId}`);
    expect(stub).toHaveTextContent(`sequenceId=${sequenceBlock.id}`);
    expect(stub).toHaveTextContent(`unitId=${unitBlock.id}`);
  });

  it('reports no page-rule diagnostics', async () => {
    await screen.findByRole('main');

    expect(runPageRules(document)).toEqual([]);
  });
});
