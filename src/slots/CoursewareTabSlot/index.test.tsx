import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { coursewareTabWidgetId } from '@src/widgets/CoursewareTab';

import CoursewareTabSlot, { coursewareTabSlotId } from '.';

jest.mock('@src/courseware', () => function CoursewareContainer({ courseId }: { courseId: string }) {
  return <div data-testid="courseware">{courseId}</div>;
});

describe('CoursewareTabSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';

  it("renders Learning's courseware widget by default", async () => {
    render(<CoursewareTabSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />);

    expect(await screen.findByTestId('courseware')).toHaveTextContent(courseId);
  });

  it("passes its props to a widget that replaces Learning's", () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: coursewareTabSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: coursewareTabWidgetId,
      component: Widget,
    }]);

    render(<CoursewareTabSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} isPreview />);

    expect(Widget.mock.calls[0][0]).toEqual({
      courseId, sequenceId, unitId, isPreview: true,
    });
    expect(screen.queryByTestId('courseware')).not.toBeInTheDocument();
  });

  it("is empty once Learning's widget is removed", () => {
    addSlotOperations([{
      slotId: coursewareTabSlotId,
      op: WidgetOperationTypes.REMOVE,
      relatedId: coursewareTabWidgetId,
    }]);

    const { container } = render(<CoursewareTabSlot courseId={courseId} />);

    expect(container).toBeEmptyDOMElement();
  });
});
