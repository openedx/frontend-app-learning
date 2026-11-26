import { getAuthenticatedHttpClient, getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import slots from '@src/slots';
import { liveTabSlotId } from '@src/slots/LiveTabSlot';
import { renderStandalone } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import { LiveTab, liveTabApp, liveTabWidgetId } from '.';

describe('liveTabApp', () => {
  it("appends the live tab to its slot, as part of Learning's slot operations", () => {
    expect(liveTabApp.slots).toEqual([{
      slotId: liveTabSlotId,
      id: liveTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: LiveTab,
    }]);
    expect(slots).toEqual(expect.arrayContaining(liveTabApp.slots ?? []));
  });
});

// The widget on another app's page: only the shell's providers, no Learning route, HTTP mocked.
describe('LiveTab on its own', () => {
  const { lmsBaseUrl } = getSiteConfig();
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const metadataUrl = appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
  const liveUrl = `${lmsBaseUrl}/api/course_live/iframe/${courseId}/`;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });
  });

  const requested = () => axiosMock.history.get.map(({ url }) => url);

  it('fetches the course metadata and the embed itself, and shows the embed', async () => {
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseHomeMetadata'));
    const { queryClient } = renderStandalone(<LiveTab courseId={courseId} />);

    expect(await screen.findByTitle('live-embed')).toHaveClass('vh-100', 'w-100', 'border-0');
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(requested()).toEqual(expect.arrayContaining([metadataUrl, liveUrl]));
  });

  it('renders nothing for a learner denied access', async () => {
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseHomeMetadata', {
      course_access: { has_access: false, error_code: 'enrollment_required' },
    }));
    const { container, queryClient } = renderStandalone(<LiveTab courseId={courseId} />);

    await waitFor(() => expect(requested()).toEqual(expect.arrayContaining([metadataUrl, liveUrl])));
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByTitle('live-embed')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
