import { Factory } from 'rosie';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { CourseParamsProvider } from '@src/generic/course-params';
import { mockCourseRequests } from '@src/tests/courseware';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';
import { render } from '@src/tests/render';
import CourseBreadcrumbs from './CourseBreadcrumbs';

const props = {
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
  sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
  isStaff: true,
};

const courseMetadata = Factory.build('courseMetadata', { courseId: props.courseId, sectionIds: [props.sectionId] });
const sequenceBlocks = [Factory.build(
  'block',
  { type: 'sequential', id: props.sequenceId, title: 'Subsection' },
  { courseId: props.courseId },
)];
const sectionBlocks = [Factory.build(
  'block',
  {
    type: 'chapter',
    id: props.sectionId,
    title: 'Section',
    children: [props.sequenceId],
  },
  { courseId: props.courseId },
)];

describe('CourseBreadcrumbs', () => {
  const initTestStore = (blocks = { sectionBlocks, sequenceBlocks }) => {
    mockCourseRequests({ courseMetadata, ...blocks });
  };

  function renderWithProvider(isPreview = false, extraProps = {}) {
    const { container } = render(
      <MemoryRouter>
        <CourseParamsProvider courseId={props.courseId} sequenceId={props.sequenceId} isPreview={isPreview}>
          <MountCourseQueryHooks courseId={props.courseId} sequenceId={props.sequenceId} />
          <CourseBreadcrumbs {...props} {...extraProps} />
        </CourseParamsProvider>
      </MemoryRouter>,
    );
    return container;
  }

  describe('in live view', () => {
    it('renders course breadcrumbs as expected', async () => {
      initTestStore();
      renderWithProvider();
      const courseHomeButtonDestination = screen.getAllByRole('link')[0].href;

      expect(courseHomeButtonDestination).toBe('http://localhost/learning/course/course-v1:edX+DemoX+Demo_Course/home');

      expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();

      expect(await screen.findAllByTestId('breadcrumb-item')).toHaveLength(2);
    });

    it('section link does not include /preview/', async () => {
      initTestStore();
      renderWithProvider();
      const sectionBreadcrumb = await screen.findByText(sectionBlocks[0].block_id);
      const sectionLink = sectionBreadcrumb.closest('a').href;

      expect(sectionLink).toBe(`http://localhost/learning/course/${props.courseId}/${props.sequenceId}`);
    });
  });

  describe('in preview', () => {
    it('renders course breadcrumbs as expected', async () => {
      initTestStore();
      renderWithProvider(true);
      const courseHomeButtonDestination = screen.getAllByRole('link')[0].href;

      expect(courseHomeButtonDestination).toBe('http://localhost/learning/course/course-v1:edX+DemoX+Demo_Course/home');

      expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();

      expect(await screen.findAllByTestId('breadcrumb-item')).toHaveLength(2);
    });

    it('section link does includes /preview/', async () => {
      initTestStore();
      renderWithProvider(true);
      const sectionBreadcrumb = await screen.findByText(sectionBlocks[0].block_id);
      const sectionLink = sectionBreadcrumb.closest('a').href;

      expect(sectionLink).toBe(`http://localhost/learning/preview/course/${props.courseId}/${props.sequenceId}`);
    });
  });

  describe('jump navigation', () => {
    const otherSequenceBlocks = [Factory.build('block', { type: 'sequential' }, { courseId: props.courseId })];
    const twoSections = {
      sequenceBlocks: [...sequenceBlocks, ...otherSequenceBlocks],
      sectionBlocks: [
        ...sectionBlocks,
        Factory.build(
          'block',
          { type: 'chapter', children: otherSequenceBlocks.map(block => block.id) },
          { courseId: props.courseId },
        ),
      ],
    };

    it('opens a menu of the sections for staff when it is on', async () => {
      initTestStore(twoSections);
      renderWithProvider(false, { jumpNav: true, unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit' });
      const sectionButton = await screen.findByRole('button', { name: sectionBlocks[0].block_id });

      fireEvent.click(sectionButton);

      expect(await screen.findByText(twoSections.sectionBlocks[1].block_id)).toBeInTheDocument();
    });

    it('shows plain links when it is off', async () => {
      initTestStore(twoSections);
      renderWithProvider();

      expect(await screen.findByRole('link', { name: sectionBlocks[0].block_id })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: sectionBlocks[0].block_id })).not.toBeInTheDocument();
    });

    it('shows plain links to learners who are not staff', async () => {
      initTestStore(twoSections);
      renderWithProvider(false, { jumpNav: true, isStaff: false });

      expect(await screen.findByRole('link', { name: sectionBlocks[0].block_id })).toBeInTheDocument();
    });
  });
});
