import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';

import { getTourData, patchTourData } from './api';

describe('product-tours api', () => {
  const tourDataUrl = `${getSiteConfig().lmsBaseUrl}/api/user_tours/v1/MockUser`;
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('camel-cases the tour data and marks tours enabled', async () => {
    axiosMock.onGet(tourDataUrl).reply(200, { course_home_tour_status: 'no-tour', show_courseware_tour: true });

    expect(await getTourData('MockUser')).toEqual({
      toursEnabled: true,
      courseHomeTourStatus: 'no-tour',
      showCoursewareTour: true,
    });
  });

  it.each([401, 403, 404])('treats a %s response as tours off', async (status) => {
    axiosMock.onGet(tourDataUrl).reply(status);

    expect(await getTourData('MockUser')).toEqual({ toursEnabled: false });
  });

  it('throws any other error', async () => {
    axiosMock.onGet(tourDataUrl).reply(500);

    await expect(getTourData('MockUser')).rejects.toThrow();
  });

  it('PATCHes the tour data', async () => {
    axiosMock.onPatch(tourDataUrl).reply(200, {});

    await patchTourData('MockUser', { show_courseware_tour: false });

    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ show_courseware_tour: false });
  });
});
