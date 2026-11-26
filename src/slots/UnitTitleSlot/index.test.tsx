import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import type { SequenceUnit } from '@src/courseware/data/sequenceMetadata';
import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import UnitTitleSlot, { unitTitleSlotId } from '.';

jest.mock('@src/courseware/course/bookmark', () => ({
  BookmarkButton: ({ isBookmarked }: { isBookmarked: boolean }) => `Bookmark button: ${isBookmarked}`,
}));

describe('UnitTitleSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';
  const unit = {
    id: unitId,
    sequenceId,
    title: 'Unit title',
    bookmarked: true,
    bookmarkedUpdateState: 'loaded',
  } as SequenceUnit;

  it('renders the title, the top unit navigation and the bookmark button by default', () => {
    const renderUnitNavigation = jest.fn(() => 'Top navigation');
    render(
      <UnitTitleSlot
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={unitId}
        unit={unit}
        renderUnitNavigation={renderUnitNavigation}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Unit title' })).toBeInTheDocument();
    expect(renderUnitNavigation).toHaveBeenCalledWith(true);
    expect(screen.getByText('Top navigation')).toBeInTheDocument();
    expect(screen.getByText('Bookmark button: true')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const renderUnitNavigation = jest.fn(() => null);
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: unitTitleSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(
      <UnitTitleSlot
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={unitId}
        unit={unit}
        renderUnitNavigation={renderUnitNavigation}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Unit title' })).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({
      courseId, sequenceId, unitId, unit, renderUnitNavigation,
    });
  });
});
