import React from 'react';
import { screen, render } from '@testing-library/react';
import JumpNavMenuItem from './JumpNavMenuItem';
import { fireEvent } from '../../setupTest';

jest.mock('@edx/frontend-platform');
jest.mock('@edx/frontend-platform/analytics');

const mockData = {
  sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
  sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',

  title: 'Demo Menu Item',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  currentUnit: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
  sequences: [
    {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
    },
    {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
    },
  ],
  isDefault: false,
};
describe('JumpNavMenuItem', () => {
  render(
    <JumpNavMenuItem
      {...mockData}
    />,
  );
  it('renders menu Item as expected with button and Text and handles clicks', () => {
    expect(screen.queryAllByRole('button')).toHaveLength(1);
    expect(screen.getByText('Demo Menu Item'));
    const navButton = screen.queryAllByRole('button')[0];
    fireEvent.click(navButton);
  });
});
