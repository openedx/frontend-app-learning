import { render } from '@testing-library/react';

import { PathwayProgressRing } from './PathwayProgressRing';

const getSegment = (container: HTMLElement) => container.querySelector('.progress-ring-segment');

describe('PathwayProgressRing', () => {
  it('fills the given share of the ring', () => {
    const { container } = render(<PathwayProgressRing percentage={25} />);

    expect(getSegment(container)).toHaveAttribute('stroke-dasharray', '25 75');
  });

  it('does not fill the ring when the percentage is zero', () => {
    const { container } = render(<PathwayProgressRing percentage={0} />);

    expect(getSegment(container)).toBeNull();
  });

  it('does not fill more than the whole ring', () => {
    const { container } = render(<PathwayProgressRing percentage={120} />);

    expect(getSegment(container)).toHaveAttribute('stroke-dasharray', '100 0');
  });

  it('passes the other props to the svg', () => {
    const { container } = render(
      <PathwayProgressRing percentage={50} className="extra" aria-hidden />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('learning-pathway-progress-ring', 'extra');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
