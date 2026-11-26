import { screen } from '@testing-library/react';

import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import { addSidebarWidgets } from '@src/tests/auxiliarySidebar';
import { render } from '@src/tests/render';

import AuxiliarySidebarSlot from '.';

describe('AuxiliarySidebarSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
  };

  const renderSlot = () => render(
    <SidebarProvider courseId={props.courseId} unitId={props.unitId}>
      <AuxiliarySidebarSlot {...props} />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );

  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders no panel while none is open', () => {
    const Panel = jest.fn(() => null);
    addSidebarWidgets([{ id: 'org.example.widget.panel', Panel }]);
    renderSlot();

    expect(Panel).not.toHaveBeenCalled();
  });

  it('renders only the open panel, and passes it its props', () => {
    const Panel = jest.fn<JSX.Element, [object]>(() => <div>Panel</div>);
    const OtherPanel = jest.fn(() => <div>Other panel</div>);
    addSidebarWidgets([
      { id: 'org.example.widget.panel', Panel },
      { id: 'org.example.widget.other', Panel: OtherPanel },
    ]);
    window.localStorage.setItem(`sidebar.${props.courseId}`, JSON.stringify('org.example.widget.panel'));
    renderSlot();

    expect(screen.getByText('Panel')).toBeInTheDocument();
    expect(Panel.mock.calls[0][0]).toEqual(props);
    expect(screen.queryByText('Other panel')).not.toBeInTheDocument();
  });
});
