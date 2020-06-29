import React from 'react';
import { render, screen } from '../../../../setupTest';
import UnitIcon from './UnitIcon';

describe('Unit Icon', () => {
  const types = {
    video: 'fa-film',
    other: 'fa-book',
    vertical: 'fa-tasks',
    problem: 'fa-edit',
    lock: 'fa-lock',
    undefined: 'fa-book',
  };

  Object.entries(types).forEach(([key, value]) => {
    it(`renders correct icon for ${key} unit`, () => {
      // Suppress warning for undefined prop type.
      if (key === 'undefined') {
        jest.spyOn(console, 'error').mockImplementation(() => {});
      }

      const { asFragment } = render(<UnitIcon type={key} />);
      expect(screen.getByAltText(value)).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
