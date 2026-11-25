import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ProgressTabRelatedLinksSlot, { progressTabRelatedLinksSlotId } from '.';

jest.mock('@src/course-home/progress-tab/related-links/RelatedLinks', () => () => 'Related links');

describe('ProgressTabRelatedLinksSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders the related links by default', () => {
    render(<ProgressTabRelatedLinksSlot courseId={courseId} />);

    expect(screen.getByText('Related links')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressTabRelatedLinksSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ProgressTabRelatedLinksSlot courseId={courseId} />);

    expect(screen.queryByText('Related links')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
