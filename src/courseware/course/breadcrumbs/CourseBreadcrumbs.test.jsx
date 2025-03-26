import { Factory } from 'rosie';
import { AppProvider } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp, initializeTestStore } from '@src/setupTest';
import CourseBreadcrumbs from './CourseBreadcrumbs';

// import { useModel, useModels } from '../../../generic/model-store';

// jest.mock('@edx/frontend-platform');
// jest.mock('@edx/frontend-platform/analytics');

// // Remove When Fully rolled out>>>
// jest.mock('../../../generic/model-store');
// jest.mock('@edx/frontend-platform/auth');
// getConfig.mockImplementation(() => ({ ENABLE_JUMPNAV: 'true' }));
// getAuthenticatedUser.mockImplementation(() => ({ administrator: true }));
// // ^^^^Remove When Fully rolled out

// jest.mock('react-redux', () => ({
//   connect: (mapStateToProps, mapDispatchToProps) => (ReactComponent) => ({
//     mapStateToProps,
//     mapDispatchToProps,
//     ReactComponent,
//   }),
//   Provider: ({ children }) => children,
//   useSelector: () => 'loaded',
// }));
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   Link: jest.fn().mockImplementation(({ to, children }) => (
//     <a href={to}>{children}</a>
//   )),
// }));

// useModels.mockImplementation((name) => {
//   if (name === 'sections') {
//     return [
//       {
//         courseId: 'course-v1:edX+DemoX+Demo_Course',
//         id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@d8a6192ade314473a78242dfeedfbf5b',
//         sequenceIds: ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction'],
//         title: 'Introduction',
//       },
//       {
//         courseId: 'course-v1:edX+DemoX+Demo_Course',
//         id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
//         sequenceIds: ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
//           'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions'],
//         title: 'Example Week 1: Getting Started',
//       },
//     ];
//   }
//   return [
//     {
//       id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
//       sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
//       title: 'Lesson 1 - Getting Started',
//       unitIds: [
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@4f6c1b4e316a419ab5b6bf30e6c708e9',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@3dc16db8d14842e38324e95d4030b8a0',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@4a1bba2a403f40bca5ec245e945b0d76',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@256f17a44983429fb1a60802203ee4e0',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@e3601c0abee6427d8c17e6d6f8fdddd1',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@134df56c516a4a0dbb24dd5facef746e',
//       ],
//     },
//     {
//       id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
//       sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
//       title: 'Homework - Question Styles',
//       unitIds: [
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2152d4a4aadc4cb0af5256394a3d1fc7',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@47dbd5f836544e61877a483c0b75606c',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@54bb9b142c6c4c22afc62bcb628f0e68',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0c92347a5c00',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_1fef54c2b23b',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2889db1677a549abb15eb4d886f95d1c',
//         'block-v1:edX+DemoX+Demo_Course+type@vertical+block@e8a5cc2aed424838853defab7be45e42',
//       ],
//     },
//   ];
// });
// useModel.mockImplementation(() => ({
//   sectionIds: ['block-v1:edX+DemoX+Demo_Course+type@chapter+block@d8a6192ade314473a78242dfeedfbf5b',
//     'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations'],
// }));

const props = {
  courseId: "course-v1:edX+DemoX+Demo_Course",
  sectionId: "block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations",
  sequenceId: "block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions",
  isStaff: true,
}

const courseMetadata = Factory.build('courseMetadata', { courseId: props.courseId, sectionIds: [props.sectionId] });
const sequenceBlocks = [Factory.build(
  'block',
  { type: 'sequential', id: props.sequenceId, title: 'Subsection' },
  { courseId: props.courseId },
)];
const sectionBlocks = [Factory.build(
  'block',
  { type: 'chapter',
    id: props.sectionId,
    title: 'Section',
    children: [{ id: props.sequenceId}],
  },
  { courseId: props.courseId },
)];

initializeMockApp();

describe('CourseBreadcrumbs', () => {
  let store = {};
  let unit;
  let sequenceId;

  const initTestStore = async () => {
    const courseBlocks = { sectionBlocks, sequenceBlocks };
    console.log(courseBlocks);
    
    store = await initializeTestStore({ courseMetadata, ...courseBlocks });
    const state = store.getState();
    [sequenceId] = Object.keys(state.courseware.courseOutline.sequences);
    const sequence = state.courseware.courseOutline.sequences[sequenceId];
    unit = state.courseware.courseOutline.units[sequence.unitIds[0]];
  };

  function renderWithProvider (pathname = '/course') {
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
