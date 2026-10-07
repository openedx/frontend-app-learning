import { act, render, screen } from '@testing-library/react';

import type { PathwayData } from './data/types';
import { useVisiblePathways } from './hooks';

const buildPathway = (id: string): PathwayData => ({
  pathway: {
    id,
    content: { displayName: `Pathway ${id}` },
    courseCount: 3,
  },
});

const pathways = ['1', '2', '3'].map(buildPathway);

// jsdom has no layout, so the sizes the hook reads are taken from data attributes
const mockLayoutProperty = (property: 'clientWidth' | 'offsetWidth' | 'offsetLeft') => (
  jest.spyOn(HTMLElement.prototype, property, 'get').mockImplementation(function getSize(this: HTMLElement) {
    return Number(this.dataset[property] ?? 0);
  })
);

// setupTest.js already replaces getComputedStyle with a mock
const mockedGetComputedStyle = jest.mocked(window.getComputedStyle);
const originalGetComputedStyle = mockedGetComputedStyle.getMockImplementation();

let resizeCallback: () => void;
const disconnect = jest.fn();

const observe = jest.fn();

class MockResizeObserver {
  constructor(callback: () => void) {
    resizeCallback = callback;
  }

  observe = observe;

  disconnect = disconnect;
}

interface HarnessProps {
  items?: PathwayData[];
  containerWidth: number;
  labelOffsets: number[];
  labelWidths?: number[];
  labelsWidth: number;
}

const Harness = ({
  items = pathways, containerWidth, labelOffsets, labelWidths = [], labelsWidth,
}: HarnessProps) => {
  const {
    containerRef, measureRef, visiblePathways, hiddenPathways,
  } = useVisiblePathways(items);
  return (
    <>
      <div ref={containerRef} data-testid="container" data-client-width={containerWidth} />
      <div ref={measureRef} data-testid="measure" data-offset-width={labelsWidth}>
        {labelOffsets.map((offset, index) => (
          <span key={offset} data-offset-left={offset} data-offset-width={labelWidths[index]} />
        ))}
      </div>
      <div data-testid="visible">{visiblePathways.map(({ pathway }) => pathway.id).join(',')}</div>
      <div data-testid="hidden">{hiddenPathways.map(({ pathway }) => pathway.id).join(',')}</div>
    </>
  );
};

const renderComponent = (props: HarnessProps) => render(<Harness {...props} />);

// A row wider than the strips used below: labels 400, 500 and 400 wide, ending at 400, 900 and 1300
const overflowingRow = {
  labelsWidth: 1300,
  labelOffsets: [0, 400, 900],
  labelWidths: [400, 500, 400],
};

describe('useVisiblePathways', () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    mockLayoutProperty('clientWidth');
    mockLayoutProperty('offsetWidth');
    mockLayoutProperty('offsetLeft');
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    jest.restoreAllMocks();
    mockedGetComputedStyle.mockImplementation(originalGetComputedStyle);
  });

  it('shows every pathway when all the labels fit', () => {
    renderComponent({ containerWidth: 1000, labelsWidth: 900, labelOffsets: [0, 300, 600] });
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2,3');
    expect(screen.getByTestId('hidden')).toBeEmptyDOMElement();
  });

  it('moves the labels that do not fit to the hidden pathways', () => {
    renderComponent({ ...overflowingRow, containerWidth: 1000 });
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2');
    expect(screen.getByTestId('hidden')).toHaveTextContent('3');
  });

  it('moves a label that would be cut to the hidden pathways instead of truncating it', () => {
    // The third label starts within the strip but ends after the space kept for the "+N" trigger
    renderComponent({
      containerWidth: 1000,
      labelsWidth: 1300,
      labelOffsets: [0, 400, 800],
      labelWidths: [400, 400, 500],
    });
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2');
    expect(screen.getByTestId('hidden')).toHaveTextContent('3');
  });

  it('moves every label to the hidden pathways when not even the first one fits', () => {
    renderComponent({
      containerWidth: 500,
      labelsWidth: 1300,
      labelOffsets: [0, 600, 900],
      labelWidths: [600, 300, 400],
    });
    expect(screen.getByTestId('visible')).toBeEmptyDOMElement();
    expect(screen.getByTestId('hidden')).toHaveTextContent('1,2,3');
  });

  it('measures the labels from the right edge in RTL', () => {
    // jsdom does not compute the direction
    mockedGetComputedStyle.mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);
    // The same row as [0, 720, 840] in LTR, mirrored: labels 700, 100 and 100 wide in a 940 wide row
    renderComponent({
      containerWidth: 800,
      labelsWidth: 940,
      labelOffsets: [240, 120, 0],
      labelWidths: [700, 100, 100],
    });
    expect(screen.getByTestId('visible')).toHaveTextContent(/^1$/);
    expect(screen.getByTestId('hidden')).toHaveTextContent('2,3');
  });

  it('recalculates the split when the container is resized', () => {
    renderComponent({ ...overflowingRow, containerWidth: 1000 });
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2');

    screen.getByTestId('container').dataset.clientWidth = '500';
    act(() => resizeCallback());

    expect(screen.getByTestId('visible')).toHaveTextContent('1');
    expect(screen.getByTestId('hidden')).toHaveTextContent('2,3');
  });

  it('recalculates the split when the labels are resized', () => {
    renderComponent({ containerWidth: 1000, labelsWidth: 900, labelOffsets: [0, 300, 600] });
    expect(observe).toHaveBeenCalledWith(screen.getByTestId('measure'));
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2,3');

    // e.g. the web font loads and every label gets wider
    const measure = screen.getByTestId('measure');
    measure.dataset.offsetWidth = '1300';
    const labels = Array.from(measure.children) as HTMLElement[];
    overflowingRow.labelOffsets.forEach((offset, index) => {
      labels[index].dataset.offsetLeft = String(offset);
      labels[index].dataset.offsetWidth = String(overflowingRow.labelWidths[index]);
    });
    act(() => resizeCallback());

    expect(screen.getByTestId('visible')).toHaveTextContent('1,2');
    expect(screen.getByTestId('hidden')).toHaveTextContent('3');
  });

  it('recalculates the split when the pathways change but not their count', () => {
    const props = { containerWidth: 1000, labelsWidth: 900, labelOffsets: [0, 300, 600] };
    const { rerender } = renderComponent(props);
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2,3');

    // Same count, but longer names
    rerender(
      <Harness
        {...props}
        {...overflowingRow}
        items={['4', '5', '6'].map(buildPathway)}
      />,
    );

    expect(screen.getByTestId('visible')).toHaveTextContent('4,5');
    expect(screen.getByTestId('hidden')).toHaveTextContent('6');
  });

  it('shows every pathway when ResizeObserver is not available', () => {
    // @ts-expect-error ResizeObserver is removed to emulate an environment without it
    delete globalThis.ResizeObserver;
    renderComponent({ ...overflowingRow, containerWidth: 1000 });
    expect(screen.getByTestId('visible')).toHaveTextContent('1,2,3');
    expect(screen.getByTestId('hidden')).toBeEmptyDOMElement();
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderComponent({ containerWidth: 1000, labelsWidth: 900, labelOffsets: [0, 300, 600] });
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
