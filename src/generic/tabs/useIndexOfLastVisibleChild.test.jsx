import { render, screen } from '@testing-library/react';

import useIndexOfLastVisibleChild from './useIndexOfLastVisibleChild';

// jsdom lays nothing out, so each element reports the width in its data-width attribute.
const widthOf = (element) => ({ width: Number(element.dataset.width ?? 0) });

const Tabs = ({ containerWidth, childWidths, withOverflow = false }) => {
  const [indexOfLastVisibleChild, containerRef, , overflowRef] = useIndexOfLastVisibleChild(false);
  return (
    <>
      <div ref={containerRef} data-width={containerWidth}>
        {childWidths.map((width, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index} data-width={width} />
        ))}
        {withOverflow && <span ref={overflowRef} data-width={30} />}
      </div>
      <output>{indexOfLastVisibleChild}</output>
    </>
  );
};

describe('useIndexOfLastVisibleChild', () => {
  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      return widthOf(this);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('finds the last child that fits in the container', () => {
    render(<Tabs containerWidth={100} childWidths={[40, 40, 40]} />);

    expect(screen.getByRole('status')).toHaveTextContent('1');
  });

  it('counts every child when they all fit', () => {
    render(<Tabs containerWidth={200} childWidths={[40, 40, 40]} />);

    expect(screen.getByRole('status')).toHaveTextContent('2');
  });

  it('leaves room for the overflow element', () => {
    render(<Tabs containerWidth={100} childWidths={[40, 40, 40]} withOverflow />);

    expect(screen.getByRole('status')).toHaveTextContent('0');
  });
});
