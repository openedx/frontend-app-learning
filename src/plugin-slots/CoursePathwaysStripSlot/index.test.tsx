import { render, screen } from '@testing-library/react';
import { getConfig, setConfig } from '@edx/frontend-platform';

import { CoursePathwaysStripSlot } from './index';

jest.mock('@src/course-pathways/CoursePathwaysStrip', () => ({
  CoursePathwaysStrip: ({ courseId }: { courseId?: string }) => (
    <div data-testid="CoursePathwaysStrip">{courseId}</div>
  ),
}));

describe('CoursePathwaysStripSlot', () => {
  const originalConfig = getConfig();

  beforeEach(() => {
    setConfig({ ...originalConfig, ENABLE_PATHWAY_PILOT_UI: true });
  });

  afterEach(() => {
    setConfig(originalConfig);
  });

  it('renders the plugin slot with the course pathways strip as its default content', () => {
    render(<CoursePathwaysStripSlot courseId="course-v1:edX+DemoX+Demo_Course" />);

    const slot = screen.getByTestId('org.openedx.frontend.learning.course_pathways_strip.v1');
    expect(slot).toContainElement(screen.getByTestId('CoursePathwaysStrip'));
    expect(screen.getByTestId('CoursePathwaysStrip')).toHaveTextContent('course-v1:edX+DemoX+Demo_Course');
  });

  it('renders nothing when the pathway pilot UI is disabled', () => {
    setConfig({ ...originalConfig, ENABLE_PATHWAY_PILOT_UI: false });
    const { container } = render(<CoursePathwaysStripSlot courseId="course-v1:edX+DemoX+Demo_Course" />);
    expect(container).toBeEmptyDOMElement();
  });
});
