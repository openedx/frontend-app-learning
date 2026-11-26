import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import EffortEstimate from './index';

describe('EffortEstimate', () => {
  it('shows the time in whole minutes, abbreviated on screen and spelled out for screen readers', () => {
    render(<EffortEstimate block={{ effortTime: 121 }} />);

    expect(screen.getByText('3 min')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('3 minutes')).toHaveClass('sr-only');
  });

  it('shows the number of activities', () => {
    const { container } = render(<EffortEstimate block={{ effortActivities: 1 }} />);

    expect(container).toHaveTextContent(/^1 activity$/);
  });

  it('shows the time and the activities together', () => {
    const { container } = render(<EffortEstimate block={{ effortTime: 60, effortActivities: 2 }} />);

    expect(container).toHaveTextContent(/^1 min1 minute \+ 2 activities$/);
  });

  it('renders nothing for a block with neither', () => {
    const { container } = render(<EffortEstimate block={{}} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('adds the class name it is given', () => {
    const { container } = render(<EffortEstimate block={{ effortActivities: 2 }} className="ml-3" />);

    expect(container.firstChild).toHaveClass('text-gray-500', 'text-monospace', 'ml-3');
  });
});
