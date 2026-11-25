import { getAuthenticatedHttpClient, getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import routes from '@src/routes';
import { outlineTabSlotId } from '@src/slots/OutlineTabSlot';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { appendBrowserTimezoneToUrl } from '@src/utils';
import { outlineTabWidgetId } from '@src/widgets/OutlineTab';

// The tab root stands in for itself: this suite is about what the route renders, not the outline.
jest.mock('@src/course-home/outline-tab', () => ({ courseId }: { courseId: string }) => `Outline of ${courseId}`);

describe('the outline route', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const outlinePath = `/learning/course/${courseId}/home`;

  beforeEach(() => {
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`))
      .reply(200, Factory.build('courseHomeMetadata'));
  });

  const renderSettled = async () => {
    const { queryClient } = renderRoutes(routes, outlinePath);
    await waitFor(() => expect(document.title).toBe('Course | Demonstration Course | Learning Test Site'));
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  };

  it("renders Learning's outline tab widget in the outline tab slot", async () => {
    await renderSettled();

    expect(await screen.findByText(`Outline of ${courseId}`)).toBeInTheDocument();
  });

  it("renders a widget that replaces Learning's by its ID", async () => {
    addSlotOperations([{
      slotId: outlineTabSlotId,
      id: 'org.example.widget.myOutline',
      op: WidgetOperationTypes.REPLACE,
      relatedId: outlineTabWidgetId,
      component: ({ courseId: id }: { courseId: string }) => <p>My outline of {id}</p>,
    }]);
    await renderSettled();

    expect(await screen.findByText(`My outline of ${courseId}`)).toBeInTheDocument();
    expect(screen.queryByText(`Outline of ${courseId}`)).not.toBeInTheDocument();
  });
});
