import { getAnalyticsService } from '@openedx/frontend-base';
import { Dropdown } from '@openedx/paragon';
import { fireEvent, screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import JumpNavMenuItem from './JumpNavMenuItem';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const { sendTrackEvent, sendTrackingLogEvent } = getAnalyticsService();

const mockData = {
  title: 'Demo Menu Item',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  currentSequence: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
  currentUnit: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
  sequences: [
    {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
    },
    {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
    },
  ],
  isDefault: false,
  onClick: jest.fn().mockName('onClick'),
};

const renderItem = (props = {}) => render(
  <Dropdown.Menu show>
    <JumpNavMenuItem {...mockData} {...props} />
  </Dropdown.Menu>,
  { wrapWithRouter: true },
);

describe('JumpNavMenuItem', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('goes to the first sequence of another destination, logging the jump', () => {
    renderItem();
    fireEvent.click(screen.getByText('Demo Menu Item'));

    const target = `/learning/course/${mockData.courseId}/${mockData.sequences[0].id}`;
    expect(mockNavigate).toHaveBeenCalledWith(target);
    expect(mockData.onClick).toHaveBeenCalled();
    const payload = {
      target_name: mockData.title,
      id: target,
      current_id: mockData.courseId,
      widget_placement: 'breadcrumb',
    };
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.jump_nav.selected', payload);
    expect(sendTrackingLogEvent).toHaveBeenCalledWith('edx.ui.lms.jump_nav.selected', payload);
  });

  it('stays on the current unit for the current destination', () => {
    renderItem({ isDefault: true, onClick: undefined });
    fireEvent.click(screen.getByText('Demo Menu Item'));

    expect(mockNavigate).toHaveBeenCalledWith(
      `/learning/course/${mockData.courseId}/${mockData.currentSequence}/${mockData.currentUnit}`,
    );
  });
});
