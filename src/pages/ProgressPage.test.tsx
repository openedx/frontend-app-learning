import { getAuthenticatedHttpClient, getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import routes from '@src/routes';
import { progressTabSlotId } from '@src/slots/ProgressTabSlot';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { appendBrowserTimezoneToUrl } from '@src/utils';
import { progressTabWidgetId } from '@src/widgets/ProgressTab';

// The tab root stands in for itself, showing the props Learning's widget gave it.
jest.mock('@src/course-home/progress-tab/ProgressTab', () => function Probe(props: object) {
  return <pre data-testid="progress">{JSON.stringify(props)}</pre>;
});

// The progress routes render the progress tab slot, which holds Learning's registered widget.
describe('the progress page', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  beforeEach(() => {
    new MockAdapter(getAuthenticatedHttpClient()).onGet(appendBrowserTimezoneToUrl(
      `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`,
    )).reply(200, Factory.build('courseHomeMetadata'));
  });

  const renderSettled = async (path: string) => {
    const { queryClient } = renderRoutes(routes, path);
    await waitFor(() => expect(document.title).toBe('Progress | Demonstration Course | Learning Test Site'));
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  };

  it.each([
    ['progress', { courseId }],
    ['progress/42', { courseId, targetUserId: '42' }],
  ])("renders Learning's progress tab widget at %s", async (segment, props) => {
    await renderSettled(`/learning/course/${courseId}/${segment}`);

    expect(JSON.parse((await screen.findByTestId('progress')).textContent!)).toEqual(props);
  });

  it.each([
    ['progress', { courseId }],
    ['progress/42', { courseId, targetUserId: '42' }],
  ])("renders the widget that replaces Learning's at %s", async (segment, props) => {
    const Widget = jest.fn<JSX.Element, [object]>(() => <p>My progress</p>);
    addSlotOperations([{
      slotId: progressTabSlotId,
      id: 'org.example.widget.myProgress',
      op: WidgetOperationTypes.REPLACE,
      relatedId: progressTabWidgetId,
      component: Widget,
    }]);

    await renderSettled(`/learning/course/${courseId}/${segment}`);

    expect(await screen.findByText('My progress')).toBeInTheDocument();
    expect(screen.queryByTestId('progress')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
