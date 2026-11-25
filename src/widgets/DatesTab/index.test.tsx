import { getAuthenticatedHttpClient, getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import slots from '@src/slots';
import { datesTabSlotId } from '@src/slots/DatesTabSlot';
import { renderStandalone } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import { DatesTab, datesTabApp, datesTabWidgetId } from '.';

describe('datesTabApp', () => {
  it("appends the dates tab to its slot, as part of Learning's slot operations", () => {
    expect(datesTabApp.slots).toEqual([{
      slotId: datesTabSlotId,
      id: datesTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: DatesTab,
    }]);
    expect(slots).toEqual(expect.arrayContaining(datesTabApp.slots ?? []));
  });
});

// The widget on another app's page: only the shell's providers, no Learning route, HTTP mocked.
describe('DatesTab on its own', () => {
  const { lmsBaseUrl } = getSiteConfig();
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const metadataUrl = appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
  const datesUrl = `${lmsBaseUrl}/api/course_home/dates/${courseId}`;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(datesUrl).reply(200, Factory.build('datesTabData'));
  });

  const requested = () => axiosMock.history.get.map(({ url }) => url);

  it('fetches the course metadata and the dates itself, and shows the timeline', async () => {
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseHomeMetadata'));
    const { queryClient } = renderStandalone(<DatesTab courseId={courseId} />);

    expect(await screen.findByRole('heading', { name: 'Important dates' })).toBeInTheDocument();
    expect((await screen.findAllByTestId('dates-day')).length).toBeGreaterThan(0);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(requested()).toEqual(expect.arrayContaining([metadataUrl, datesUrl]));
  });

  it('renders nothing for a learner denied access', async () => {
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseHomeMetadata', {
      course_access: { has_access: false, error_code: 'enrollment_required' },
    }));
    const { container, queryClient } = renderStandalone(<DatesTab courseId={courseId} />);

    await waitFor(() => expect(requested()).toEqual(expect.arrayContaining([metadataUrl, datesUrl])));
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'Important dates' })).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
