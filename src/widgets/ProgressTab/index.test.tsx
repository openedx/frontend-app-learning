import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import slots from '@src/slots';
import { renderStandalone } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import {
  ProgressTab, progressTabApp, progressTabWidgetId,
} from '.';

// The widget as another app's page would show it: only the shell's providers, a router away from Learning's routes,
// and the LMS mocked over HTTP.
describe('ProgressTab widget, standalone', () => {
  const { lmsBaseUrl } = getSiteConfig();
  const metadata = Factory.build('courseHomeMetadata');
  const courseId: string = metadata.id;
  const metadataUrl = appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
  const progressUrl = `${lmsBaseUrl}/api/course_home/progress/${courseId}`;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(metadataUrl).reply(200, metadata);
    axiosMock.onGet(progressUrl).reply(200, Factory.build('progressTabData'));
    axiosMock.onGet(`${progressUrl}/42/`).reply(200, Factory.build('progressTabData', { username: 'otherlearner' }));
  });

  const requestedUrls = () => axiosMock.history.get.map(({ url }) => url);

  const expectProgressShown = async (heading = 'Your progress') => {
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(heading);
    expect(await screen.findByRole('heading', { name: 'Grades' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  };

  it("shows the learner's progress, from requests of its own", async () => {
    renderStandalone(<ProgressTab courseId={courseId} />);

    await expectProgressShown();
    expect(requestedUrls()).toEqual(expect.arrayContaining([metadataUrl, progressUrl]));
  });

  it("asks for another learner's progress when given one", async () => {
    renderStandalone(<ProgressTab courseId={courseId} targetUserId="42" />);

    await expectProgressShown('Course progress for otherlearner');
    expect(requestedUrls()).toEqual(expect.arrayContaining([metadataUrl, `${progressUrl}/42/`]));
    expect(requestedUrls()).not.toContain(progressUrl);
  });

  it("is appended to the progress tab slot by Learning's slot operations", () => {
    expect(progressTabApp.slots).toEqual([expect.objectContaining({
      slotId: 'org.openedx.frontend.slot.learning.progressTab.v1',
      id: progressTabWidgetId,
      component: ProgressTab,
    })]);
    expect(slots).toEqual(expect.arrayContaining(progressTabApp.slots ?? []));
  });
});
