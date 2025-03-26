import { Factory } from 'rosie';
import { AppProvider } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { initializeMockApp, initializeTestStore } from '@src/setupTest';
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
    children: [{ id: props.sequenceId }],
  },
  { courseId: props.courseId },
)];

initializeMockApp();

describe('CourseBreadcrumbs', () => {
  let store = {};

  const initTestStore = async () => {
    store = await initializeTestStore({ courseMetadata, sectionBlocks, sequenceBlocks });
  };

  function renderWithProvider(pathname = '/course') {
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <IntlProvider locale="en">
          <MemoryRouter initialEntries={[{ pathname }]}>
            <CourseBreadcrumbs {...props} />
          </MemoryRouter>
        </IntlProvider>
      </AppProvider>,
    );
    return container;
  }

  describe('in live view', () => {
    it('renders course breadcrumbs as expected', async () => {
      await initTestStore();
      renderWithProvider();
      const courseHomeButtonDestination = screen.getAllByRole('link')[0].href;

      expect(courseHomeButtonDestination).toBe('http://localhost/course/course-v1:edX+DemoX+Demo_Course/home');

      expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();

      expect(screen.queryAllByTestId('breadcrumb-item')).toHaveLength(2);
    });

    it('section link does not include /preview/', async () => {
      await initTestStore();
      renderWithProvider();
      const sectionBreadcrumb = screen.getByText(sectionBlocks[0].block_id);
      const sectionLink = sectionBreadcrumb.closest('a').href;

      expect(sectionLink.includes('/preview/')).toBeFalsy();
    });
  });

  describe('in live view', () => {
    it('renders course breadcrumbs as expected', async () => {
      await initTestStore();
      renderWithProvider('/preview/courses');
      const courseHomeButtonDestination = screen.getAllByRole('link')[0].href;

      expect(courseHomeButtonDestination).toBe('http://localhost/course/course-v1:edX+DemoX+Demo_Course/home');

      expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();

      expect(screen.queryAllByTestId('breadcrumb-item')).toHaveLength(2);
    });

    it('section link does includes /preview/', async () => {
      await initTestStore();
      renderWithProvider('/preview/courses');
      const sectionBreadcrumb = screen.getByText(sectionBlocks[0].block_id);
      const sectionLink = sectionBreadcrumb.closest('a').href;

      expect(sectionLink.includes('/preview/')).toBeTruthy();
    });
  });
});
