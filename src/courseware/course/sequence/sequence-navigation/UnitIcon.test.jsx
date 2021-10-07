import React from 'react';
import { Factory } from 'rosie';
import { initializeTestStore, render } from '../../../../setupTest';
import UnitIcon from './UnitIcon';

describe('Unit Icon', () => {
  const types = {
    video: 'fa-video',
    other: 'fa-book',
    vertical: 'fa-tasks',
    problem: 'fa-edit',
    lock: 'fa-lock',
    undefined: 'fa-book',
  };

  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Object.keys(types).map(contentType => Factory.build(
    'block',
    { id: contentType, type: contentType },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
  });

  unitBlocks.forEach(block => {
    it(`renders correct icon for ${block.type} unit`, () => {
      // Suppress warning for undefined prop type.
      if (block.type === 'undefined') {
        jest.spyOn(console, 'error').mockImplementation(() => {});
      }

      const { container } = render(<UnitIcon type={block.type} />);
      expect(container.querySelector('svg')).toHaveClass(types[block.type]);
    });
  });
});
