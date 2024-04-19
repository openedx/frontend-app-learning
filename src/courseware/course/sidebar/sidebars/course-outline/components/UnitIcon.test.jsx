import { render } from '@testing-library/react';

import UnitIcon, { UNIT_ICON_TYPES } from './UnitIcon';

describe('<UnitIcon />', () => {
  Object.keys(UNIT_ICON_TYPES).forEach((type) => {
    it(`renders default ${type} icon correctly`, () => {
      const { container } = render(<UnitIcon type={type} isCompleted={false} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).not.toHaveClass('text-success');
    });

    it(`renders default ${type} completed icon correctly`, () => {
      const { container } = render(<UnitIcon type={type} isCompleted />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-success');
    });
  });
});
