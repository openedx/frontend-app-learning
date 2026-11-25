import { getAppConfig, getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { appId } from '@src/constants';
import slots from '@src/slots';
import { outlineTabSlotId } from '@src/slots/OutlineTabSlot';
import { renderStandalone } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import { OutlineTab, outlineTabApp, outlineTabWidgetId } from '.';

describe('outlineTabApp', () => {
  it("appends the outline tab to its slot, as one of Learning's slot operations", () => {
    expect(outlineTabApp.slots).toEqual([expect.objectContaining({
      slotId: outlineTabSlotId,
      id: outlineTabWidgetId,
      component: OutlineTab,
    })]);
    expect(slots).toEqual(expect.arrayContaining(outlineTabApp.slots ?? []));
  });
});

// The widget as another app's page would show it: only the shell's providers, a router away from Learning's routes,
// and the LMS mocked.
describe('OutlineTab on its own', () => {
  const { lmsBaseUrl } = getSiteConfig();
  const metadata = Factory.build('courseHomeMetadata');
  const courseId: string = metadata.id;
  const metadataUrl = appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
  const outlineUrl = `${lmsBaseUrl}/api/course_home/outline/${courseId}`;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(metadataUrl).reply(200, metadata);
    axiosMock.onGet(outlineUrl).reply(200, Factory.build('outlineTabData'));
    axiosMock.onGet(
      `${getAppConfig(appId).EXAMS_BASE_URL}/api/v1/student/course_id/${encodeURIComponent(courseId)}/onboarding?username=MockUser`,
    ).reply(200, { onboarding_status: 'created', onboarding_link: 'test', expiration_date: null });
  });

  it('shows the course outline and makes its own requests', async () => {
    renderStandalone(<OutlineTab courseId={courseId} />);

    // The account activation modal can hide the page behind it from the accessibility tree.
    expect(await screen.findByRole('heading', { level: 1, hidden: true })).toHaveTextContent('Demonstration Course');
    expect(await screen.findByRole('button', { name: 'Expand all', hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Title of Section', { exact: false })).toBeInTheDocument();
    // The alerts load lazily.
    expect(await screen.findByTestId('private-course-alert')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    const requested = axiosMock.history.get.map(({ url }) => url);
    expect(requested).toContain(metadataUrl);
    expect(requested).toContain(outlineUrl);
  });
});
