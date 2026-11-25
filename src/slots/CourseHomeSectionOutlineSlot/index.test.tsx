import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import type { CourseHomeOutlineSection } from '@src/course-home/data/courseHomeOutline';
import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseHomeSectionOutlineSlot, { courseHomeSectionOutlineSlotId } from '.';

jest.mock('@src/course-home/outline-tab/section-outline/Section', () => {
  const { createElement } = jest.requireActual('react');
  return ({ section }) => createElement('li', null, section.title);
});

describe('CourseHomeSectionOutlineSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const section = (id: string, title: string): CourseHomeOutlineSection => ({
    complete: false, id, title, resumeBlock: false, sequenceIds: [], hideFromTOC: null,
  });
  const sections = { one: section('one', 'Section one'), two: section('two', 'Section two') };
  const sectionIds = ['one', 'two'];

  it('renders the list of sections by default', () => {
    render(<CourseHomeSectionOutlineSlot courseId={courseId} expandAll={false} sectionIds={sectionIds} sections={sections} />);

    expect(screen.getByText('Section one')).toBeInTheDocument();
    expect(screen.getByText('Section two')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseHomeSectionOutlineSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseHomeSectionOutlineSlot courseId={courseId} expandAll sectionIds={sectionIds} sections={sections} />);

    expect(screen.queryByText('Section one')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({
      courseId, expandAll: true, sectionIds, sections,
    });
  });
});
