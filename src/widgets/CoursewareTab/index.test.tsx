import { getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';

import { coursewareTabSlotId } from '@src/slots/CoursewareTabSlot';
import slots from '@src/slots';
import { mockCourseRequests } from '@src/tests/courseware';
import { renderStandalone } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import {
  CoursewareTab, coursewareTabApp, coursewareTabWidgetId,
} from '.';

describe('CoursewareTab', () => {
  // The courseware's first load compiles it, which can outlast findBy's timeout.
  beforeAll(() => import('@src/courseware'));

  it("is appended to the courseware tab's slot, as part of Learning's slot operations", () => {
    expect(coursewareTabApp.slots).toEqual([{
      slotId: coursewareTabSlotId,
      id: coursewareTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: CoursewareTab,
    }]);
    expect(slots).toEqual(expect.arrayContaining(coursewareTabApp.slots ?? []));
  });

  it("renders a unit on another app's page, with requests of its own", async () => {
    // The sequence scrolls to the top on load, which jsdom does not implement.
    global.scrollTo = jest.fn();
    const course = mockCourseRequests();
    const { lmsBaseUrl } = getSiteConfig();

    const { queryClient } = renderStandalone(<CoursewareTab courseId={course.courseId} sequenceId={course.sequenceId} unitId={course.unitId} />);

    expect(await screen.findByTitle(course.unitBlocks[0].display_name)).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /next/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /previous/i }).length).toBeGreaterThan(0);

    const requested = course.axiosMock.history.get.map(({ url }) => url);
    expect(requested).toEqual(expect.arrayContaining([
      appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/courseware/course/${course.courseId}`),
      appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${course.courseId}`),
      `${lmsBaseUrl}/api/courseware/sequence/${course.sequenceId}`,
    ]));
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  });
});
