import classNames from 'classnames';
import type { ReactNode, SVGProps } from 'react';

// A radius that gives a circumference of 100, so the stroke dash values are percentages.
const RADIUS = 15.91549430918954;
// Strokes start at 3 o'clock; shifting them back a quarter of the circle starts them at 12 o'clock.
const TOP_OFFSET = 25;

export interface PathwayProgressRingProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  percentage: number;
  // Drawn in the center of the ring, in the 42x42 coordinates of its viewBox.
  children?: ReactNode;
}

export const PathwayProgressRing = ({
  percentage,
  className,
  children,
  ...props
}: PathwayProgressRingProps) => {
  const filled = Math.min(Math.max(percentage, 0), 100);

  return (
    <svg
      className={classNames('learning-pathway-progress-ring', className)}
      viewBox="0 0 42 42"
      {...props}
    >
      <circle className="progress-ring-track" cx="21" cy="21" r={RADIUS} />
      {filled > 0 && (
        <circle
          className="progress-ring-segment"
          cx="21"
          cy="21"
          r={RADIUS}
          strokeDasharray={`${filled} ${100 - filled}`}
          strokeDashoffset={TOP_OFFSET}
        />
      )}
      {children}
    </svg>
  );
};
