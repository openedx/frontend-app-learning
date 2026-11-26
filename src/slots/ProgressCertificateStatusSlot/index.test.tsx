import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ProgressCertificateStatusSlot, { progressCertificateStatusSlotId } from '.';

describe('ProgressCertificateStatusSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders its children by default', () => {
    render(<ProgressCertificateStatusSlot courseId={courseId}>Certificate body</ProgressCertificateStatusSlot>);

    expect(screen.getByText('Certificate body')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressCertificateStatusSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ProgressCertificateStatusSlot courseId={courseId}>Certificate body</ProgressCertificateStatusSlot>);

    expect(screen.queryByText('Certificate body')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
