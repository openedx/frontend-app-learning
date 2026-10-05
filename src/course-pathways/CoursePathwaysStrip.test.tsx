import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useCoursePathways } from './data/apiHooks';
import type { PathwayData } from './data/types';
import {
  courseIdWithPathways, dataEngineering, loremIpsum, machineLearning,
} from './data/__fixtures__/pathways';
import { useVisiblePathways } from './hooks';
import { MorePathwaysPopover } from './MorePathwaysPopover';
import { CoursePathwaysStrip } from './CoursePathwaysStrip';

jest.mock('./data/apiHooks', () => ({
  useCoursePathways: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useVisiblePathways: jest.fn(),
}));

jest.mock('./MorePathwaysPopover', () => ({
  MorePathwaysPopover: jest.fn(() => <div>MorePathwaysPopover</div>),
}));

const mockUseCoursePathways = useCoursePathways as jest.Mock;
const mockUseVisiblePathways = useVisiblePathways as jest.MockedFunction<typeof useVisiblePathways>;

const pathways = [dataEngineering, machineLearning, loremIpsum];

const mockPathways = (data?: PathwayData[]) => {
  mockUseCoursePathways.mockReturnValue({ data });
};

const mockSplit = (visiblePathways: PathwayData[], hiddenPathways: PathwayData[]) => {
  mockUseVisiblePathways.mockReturnValue({
    containerRef: { current: null },
    measureRef: { current: null },
    visiblePathways,
    hiddenPathways,
  });
};

const renderComponent = () => render(
  <IntlProvider locale="en">
    <CoursePathwaysStrip courseId={courseIdWithPathways} />
  </IntlProvider>,
);

// The labels shown in the strip, leaving out the hidden copies used for measuring
const getVisibleLabels = (container: HTMLElement) => Array.from(
  container.querySelectorAll('.course-pathways-strip-container > .course-pathways-strip-label'),
);

describe('CoursePathwaysStrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathways(pathways);
    mockSplit(pathways, []);
  });

  it('renders nothing when the course has no pathways', () => {
    mockPathways([]);
    mockSplit([], []);
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while the pathways are loading', () => {
    mockPathways(undefined);
    mockSplit([], []);
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('gets the pathways of the course', () => {
    renderComponent();
    expect(mockUseCoursePathways).toHaveBeenCalledWith(courseIdWithPathways);
    expect(mockUseVisiblePathways).toHaveBeenCalledWith(pathways);
  });

  it('renders the "Course included in" label and every visible pathway', () => {
    const { container } = renderComponent();
    expect(screen.getByText('Course included in')).toBeInTheDocument();
    expect(getVisibleLabels(container).map((label) => label.textContent)).toEqual([
      'Data Engineering Fundamentals',
      'Introduction to Machine Learning',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
    ]);
  });

  it('does not render the popover nor truncate labels when every pathway fits', () => {
    const { container } = renderComponent();
    expect(MorePathwaysPopover).not.toHaveBeenCalled();
    expect(container.querySelector('.is-truncated')).not.toBeInTheDocument();
  });

  it('truncates the last visible label and passes the hidden pathways to the popover', () => {
    mockSplit([dataEngineering, machineLearning], [loremIpsum]);
    const { container } = renderComponent();

    const visibleLabels = getVisibleLabels(container);
    expect(visibleLabels).toHaveLength(2);
    expect(visibleLabels[0]).not.toHaveClass('is-truncated');
    expect(visibleLabels[1]).toHaveClass('is-truncated');

    expect(screen.getByText('MorePathwaysPopover')).toBeInTheDocument();
    expect(MorePathwaysPopover).toHaveBeenCalledWith({ pathways: [loremIpsum] }, expect.anything());
  });

  it('renders every pathway in the hidden row used for measuring', () => {
    mockSplit([dataEngineering], [machineLearning, loremIpsum]);
    const { container } = renderComponent();
    const measureRow = container.querySelector('.course-pathways-strip-measure');
    expect(measureRow).toHaveAttribute('aria-hidden');
    expect(measureRow?.children).toHaveLength(pathways.length);
  });
});
