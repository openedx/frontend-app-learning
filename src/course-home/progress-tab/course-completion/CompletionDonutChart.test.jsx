import { mergeConfig } from '@edx/frontend-platform';

import { initializeMockApp, render } from '../../../setupTest';
import { useProgressData } from '../hooks';
import CompletionDonutChart from './CompletionDonutChart';

jest.mock('../hooks', () => ({
  useProgressData: jest.fn(),
}));

describe('CompletionDonutChart', () => {
  const setPrecision = (COMPLETION_PERCENTAGE_PRECISION) => {
    mergeConfig({ COMPLETION_PERCENTAGE_PRECISION });
  };

  beforeAll(async () => {
    initializeMockApp();
  });

  beforeEach(() => {
    // 4 complete, 7 incomplete and 1 locked unit out of 12, so that none of the
    // percentages can be represented exactly.
    useProgressData.mockReturnValue({
      completionSummary: {
        completeCount: 4,
        incompleteCount: 7,
        lockedCount: 1,
      },
    });
  });

  afterEach(() => {
    setPrecision(0);
  });

  // The length of a donut segment is the first value of its `stroke-dasharray`.
  const getSegmentLength = (container, segmentClass) => (
    container.querySelector(`.${segmentClass}`)?.getAttribute('stroke-dasharray').split(' ')[0]
  );

  const renderChart = () => {
    const { container } = render(<CompletionDonutChart />);
    return {
      donutPercentage: container.querySelector('.donut-chart-number').textContent,
      screenReaderText: container.querySelector('.sr-only').textContent,
      completeSegment: getSegmentLength(container, 'complete-stroke'),
      incompleteSegment: getSegmentLength(container, 'incomplete-stroke'),
      lockedSegment: getSegmentLength(container, 'locked-stroke'),
    };
  };

  it('rounds the percentages to whole numbers by default', () => {
    const { donutPercentage, screenReaderText } = renderChart();

    expect(donutPercentage).toEqual('33%');
    expect(screenReaderText).toContain('You have completed 33% of content in this course.');
    expect(screenReaderText).toContain('You have not completed 59% of content in this course');
    expect(screenReaderText).toContain('8% of content in this course is locked');
  });

  it('rounds the percentages to the configured precision', () => {
    setPrecision(2);
    const { donutPercentage, screenReaderText } = renderChart();

    expect(donutPercentage).toEqual('33.33%');
    expect(screenReaderText).toContain('You have completed 33.33% of content in this course.');
    expect(screenReaderText).toContain('You have not completed 58.34% of content in this course');
    expect(screenReaderText).toContain('8.33% of content in this course is locked');
  });

  it('draws segments that add up to 100% without floating point residue', () => {
    setPrecision(2);
    const { completeSegment, incompleteSegment, lockedSegment } = renderChart();

    // 100 - 33.33 - 8.33 evaluates to 58.339999999999996 before rounding.
    expect([completeSegment, incompleteSegment, lockedSegment]).toEqual(['33.33', '58.34', '8.33']);
  });

  it('falls back to whole numbers for a non-numeric precision', () => {
    setPrecision('two');
    const { donutPercentage } = renderChart();

    expect(donutPercentage).toEqual('33%');
  });

  it('omits the segments for units that are not present', () => {
    useProgressData.mockReturnValue({
      completionSummary: {
        completeCount: 0,
        incompleteCount: 3,
        lockedCount: 0,
      },
    });
    setPrecision(2);
    const {
      donutPercentage, screenReaderText, completeSegment, incompleteSegment, lockedSegment,
    } = renderChart();

    expect(donutPercentage).toEqual('0%');
    expect(screenReaderText).toContain('You have not completed 100% of content in this course');
    expect(screenReaderText).not.toContain('is locked');
    expect(completeSegment).toBeUndefined();
    expect(incompleteSegment).toEqual('100');
    expect(lockedSegment).toBeUndefined();
  });
});
