import { WidgetOperationTypes } from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ProgressTabCertificateStatusMainBodySlot, { progressTabCertificateStatusMainBodySlotId } from '.';

jest.mock('@src/course-home/progress-tab/certificate-status/CertificateStatus', () => () => 'Certificate status');

describe('ProgressTabCertificateStatusMainBodySlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const { innerWidth } = global;
  const wide = breakpoints.large.minWidth ?? 0;
  const narrow = wide - 1;

  afterEach(() => {
    global.innerWidth = innerWidth;
  });

  it('renders the certificate status by default on a narrow screen', () => {
    global.innerWidth = narrow;
    render(<ProgressTabCertificateStatusMainBodySlot courseId={courseId} />);

    expect(screen.getByText('Certificate status')).toBeInTheDocument();
  });

  it('renders nothing by default on a wide screen', () => {
    global.innerWidth = wide;
    render(<ProgressTabCertificateStatusMainBodySlot courseId={courseId} />);

    expect(screen.queryByText('Certificate status')).not.toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    global.innerWidth = narrow;
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressTabCertificateStatusMainBodySlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ProgressTabCertificateStatusMainBodySlot courseId={courseId} />);

    expect(screen.queryByText('Certificate status')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
