import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ContentIFrameLoaderSlot, { contentIFrameLoaderSlotId } from '.';

jest.mock('@src/generic/PageLoading', () => ({ srMessage }: { srMessage: string }) => `Page loading: ${srMessage}`);

describe('ContentIFrameLoaderSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';
  const loadingMessage = 'Loading learning sequence...';

  it('renders the page loader by default', () => {
    render(<ContentIFrameLoaderSlot courseId={courseId} unitId={unitId} loadingMessage={loadingMessage} />);

    expect(screen.getByText(`Page loading: ${loadingMessage}`)).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: contentIFrameLoaderSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ContentIFrameLoaderSlot courseId={courseId} unitId={unitId} loadingMessage={loadingMessage} />);

    expect(screen.queryByText(`Page loading: ${loadingMessage}`)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, unitId, loadingMessage });
  });
});
