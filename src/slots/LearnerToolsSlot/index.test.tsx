import { getAuthenticatedUser, setAuthenticatedUser, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { authenticatedUser } from '@src/tests/authenticatedUser';
import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import LearnerToolsSlot, { learnerToolsSlotId } from '.';

describe('LearnerToolsSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
    isStaff: false,
    enrollmentMode: 'verified',
  };
  const originalUser = getAuthenticatedUser();

  const addWidget = () => {
    const Widget = jest.fn<React.ReactNode, [object]>(() => <div data-testid="learner-tool">Learner tool</div>);
    addSlotOperations([{
      slotId: learnerToolsSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.APPEND,
      component: Widget,
    }]);
    return Widget;
  };

  afterEach(() => {
    setAuthenticatedUser(originalUser);
  });

  it('renders nothing by default', () => {
    const { container } = render(<LearnerToolsSlot {...props} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('passes its props and the signed-in user\'s id to an appended widget', () => {
    const Widget = addWidget();

    render(<LearnerToolsSlot {...props} />);

    expect(Widget.mock.calls[0][0]).toEqual({ ...props, userId: authenticatedUser.userId });
  });

  it('renders into document.body, outside the page', () => {
    addWidget();

    const { container } = render(<LearnerToolsSlot {...props} />);

    expect(container).toBeEmptyDOMElement();
    expect(document.body).toContainElement(screen.getByTestId('learner-tool'));
  });

  it('defaults the enrollment mode to null', () => {
    const Widget = addWidget();
    render(
      <LearnerToolsSlot courseId={props.courseId} sequenceId={props.sequenceId} unitId={props.unitId} isStaff={false} />,
    );

    expect(Widget.mock.calls[0][0]).toEqual(expect.objectContaining({ enrollmentMode: null }));
  });

  it('renders nothing for a learner who is not signed in', () => {
    const Widget = addWidget();
    setAuthenticatedUser(null);

    render(<LearnerToolsSlot {...props} />);

    expect(screen.queryByTestId('learner-tool')).not.toBeInTheDocument();
    expect(Widget).not.toHaveBeenCalled();
  });
});
