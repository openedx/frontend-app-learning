import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseRecommendationsSlot, { courseRecommendationsSlotId } from '.';

jest.mock(
  '@src/courseware/course/course-exit/CourseRecommendations',
  () => ({ variant }: { variant: string }) => `Recommendations (${variant})`,
);

describe('CourseRecommendationsSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const variant = 'celebration_with_cert';

  it('renders the course recommendations by default', () => {
    render(<CourseRecommendationsSlot courseId={courseId} variant={variant} />);

    expect(screen.getByText(`Recommendations (${variant})`)).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseRecommendationsSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseRecommendationsSlot courseId={courseId} variant={variant} />);

    expect(screen.queryByText(`Recommendations (${variant})`)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, variant });
  });
});
