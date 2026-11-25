import { screen } from '@testing-library/react';

import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import { addSidebarWidgets } from '@src/tests/auxiliarySidebar';
import { render } from '@src/tests/render';

import AuxiliarySidebarTriggerSlot from '.';

describe('AuxiliarySidebarTriggerSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
  };

  const renderSlot = () => render(
    <SidebarProvider courseId={props.courseId} unitId={props.unitId}>
      <AuxiliarySidebarTriggerSlot {...props} />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );

  it('renders nothing with no sidebar widgets available', () => {
    const { container } = renderSlot();

    expect(container).toBeEmptyDOMElement();
  });

  it('passes its props to the trigger of an available widget', () => {
    const Trigger = jest.fn<JSX.Element, [object]>(() => <button type="button">Trigger</button>);
    addSidebarWidgets([{ id: 'org.example.widget.panel', Trigger }]);
    renderSlot();

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    expect(Trigger.mock.calls[0][0]).toEqual(props);
  });
});
