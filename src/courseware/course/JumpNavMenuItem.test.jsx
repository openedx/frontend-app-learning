import React from 'react';
import { screen, render } from '@testing-library/react';
import { JumpNavMenuItem } from './JumpNavMenuItem';
import { fireEvent } from '../../setupTest';

jest.mock('@edx/frontend-platform');
jest.mock('@edx/frontend-platform/analytics');

jest.mock('react-redux', () => ({
  connect: (mapStateToProps, mapDispatchToProps) => (ReactComponent) => ({
    mapStateToProps,
    mapDispatchToProps,
    ReactComponent,
  }),
  Provider: ({ children }) => children,
  useSelector: () => 'loaded',
}));

const mockCheckBlock = jest.fn(() => Promise.resolve(true)); // check all units

const mockData = {
  sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
  sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',

  title: 'Demo Menu Item',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  currentUnit: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
  sequences: [
    {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
      blockType: 'sequential',
      unitIds: [
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@4f6c1b4e316a419ab5b6bf30e6c708e9',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@3dc16db8d14842e38324e95d4030b8a0',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@4a1bba2a403f40bca5ec245e945b0d76',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@256f17a44983429fb1a60802203ee4e0',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@e3601c0abee6427d8c17e6d6f8fdddd1',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@134df56c516a4a0dbb24dd5facef746e',
      ],
      legacyWebUrl: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/jump_to/block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5?experience=legacy',
      sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
    },
    {
      id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
      title: 'Homework - Question Styles',
      legacyWebUrl: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/jump_to/block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions?experience=legacy',
      unitIds: [
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2152d4a4aadc4cb0af5256394a3d1fc7',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@47dbd5f836544e61877a483c0b75606c',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@54bb9b142c6c4c22afc62bcb628f0e68',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0c92347a5c00',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_1fef54c2b23b',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2889db1677a549abb15eb4d886f95d1c',
        'block-v1:edX+DemoX+Demo_Course+type@vertical+block@e8a5cc2aed424838853defab7be45e42',
      ],
      sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
    },
  ],
  isDefault: false,
  actions: {
    checkBlockCompletion: mockCheckBlock,
  },
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
    expect(mockCheckBlock).toBeCalledTimes(14); // number of units to check on load.
  });
});
