import {
  getAuthenticatedHttpClient, getSiteConfig, runPageRules, WidgetOperationTypes,
} from '@openedx/frontend-base';
import { focusManager } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import routes from '@src/routes';
import { liveTabSlotId } from '@src/slots/LiveTabSlot';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { liveTabWidgetId } from '@src/widgets/LiveTab';
import { appendBrowserTimezoneToUrl } from '../../utils';

describe('LiveTab', () => {
  let axiosMock;

  const courseMetadata = Factory.build('courseHomeMetadata', { user_timezone: 'America/New_York' });
  const { id: courseId } = courseMetadata;

  let courseMetadataUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const liveUrl = `${getSiteConfig().lmsBaseUrl}/api/course_live/iframe/${courseId}/`;

  const renderLive = () => renderRoutes(routes, `/learning/course/${courseId}/live`);

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  });

  afterEach(() => {
    focusManager.setFocused(undefined);
  });

  it('renders the live iframe html from the query', async () => {
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });

    renderLive();

    await waitFor(() => expect(screen.getByTitle('live-embed')).toBeInTheDocument());
  });

  it('renders the tab frame with no embed when the course has no live configuration', async () => {
    axiosMock.onGet(liveUrl).reply(404);

    const { queryClient } = renderLive();
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    await waitFor(() => expect(document.getElementById('live_tab')).toBeInTheDocument());
    expect(document.getElementById('live_tab')).toBeEmptyDOMElement();
  });

  it('reports no page-rule diagnostics', async () => {
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });

    renderLive();
    await screen.findByTitle('live-embed');

    expect(runPageRules(document)).toEqual([]);
  });

  it('does not refetch the live embed when the window regains focus', async () => {
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });

    renderLive();
    await waitFor(() => expect(screen.getByTitle('live-embed')).toBeInTheDocument());

    const liveCallCount = () => axiosMock.history.get.filter(req => req.url === liveUrl).length;
    expect(liveCallCount()).toBe(1);

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    expect(liveCallCount()).toBe(1);
  });

  it('re-applies the sizing classes when the iframe html changes', async () => {
    axiosMock.onGet(liveUrl).replyOnce(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live-a"></iframe>',
    });
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live-b"></iframe>',
    });

    const { queryClient } = renderLive();
    await waitFor(() => expect(screen.getByTitle('live-embed')).toHaveAttribute('src', 'https://example.com/live-a'));
    expect(screen.getByTitle('live-embed')).toHaveClass('vh-100', 'w-100', 'border-0');

    await act(async () => { await queryClient.invalidateQueries(); });

    await waitFor(() => expect(screen.getByTitle('live-embed')).toHaveAttribute('src', 'https://example.com/live-b'));
    expect(screen.getByTitle('live-embed')).toHaveClass('vh-100', 'w-100', 'border-0');
  });

  it('requests the course metadata once per load', async () => {
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });
    const { queryClient } = renderLive();
    await screen.findByTitle('live-embed');
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(axiosMock.history.get.filter((req) => req.url === courseMetadataUrl)).toHaveLength(1);
  });

  it("shows a widget that replaces Learning's by its ID, in the page's place", async () => {
    addSlotOperations([{
      slotId: liveTabSlotId,
      id: 'org.example.widget.myLiveSessions',
      op: WidgetOperationTypes.REPLACE,
      relatedId: liveTabWidgetId,
      component: ({ courseId: id }) => <p>My live sessions for {id}</p>,
    }]);
    const { queryClient } = renderLive();

    expect(await screen.findByText(`My live sessions for ${courseId}`)).toBeInTheDocument();
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    // The page still sets the title; Learning's tab never loads, so its embed is not requested.
    await waitFor(() => expect(document.title).toBe(`${courseMetadata.title} | Learning Test Site`));
    expect(document.getElementById('live_tab')).not.toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === liveUrl)).toHaveLength(0);
  });
});
