import { Factory } from 'rosie';
import { getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import routes from '@src/routes';
import { courseBreadcrumbsSlotId } from '@src/slots/CourseBreadcrumbsSlot';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import { courseBreadcrumbsSlotOperation, courseBreadcrumbsWidgetId } from '.';

describe('courseBreadcrumbsSlotOperation', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth!;
    global.scrollTo = jest.fn();
  });

  // A course with two sections of one sequence each, so the section breadcrumb has somewhere to jump to.
  const mockTwoSectionCourse = ({ isStaff = false } = {}) => {
    const courseMetadata = Factory.build('courseMetadata');
    const courseId = courseMetadata.id;
    const unitBlocks = [Factory.build('block', { type: 'vertical' }, { courseId })];
    const sequenceBlocks = [0, 1].map(() => Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId },
    ));
    const sectionBlocks = sequenceBlocks.map((sequenceBlock) => Factory.build(
      'block',
      { type: 'chapter', children: [sequenceBlock.id] },
      { courseId },
    ));
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { is_staff: isStaff });
    const options = {
      courseMetadata, courseHomeMetadata, unitBlocks, sequenceBlocks, sectionBlocks,
    };
    return mockCourseRequests(options);
  };

  const renderCourse = ({ courseId, sequenceId, unitId }: { courseId: string; sequenceId: string; unitId: string }) => (
    renderRoutes(routes, unitPath(courseId, sequenceId, unitId))
  );

  const enableJumpNav = () => addSlotOperations([{
    slotId: courseBreadcrumbsSlotId,
    op: WidgetOperationTypes.OPTIONS,
    relatedId: courseBreadcrumbsWidgetId,
    options: { jumpNav: true },
  }]);

  it('renders the breadcrumbs: the course home, the section and the sequence', async () => {
    addSlotOperations([courseBreadcrumbsSlotOperation]);
    const fixtures = mockCourseRequests();
    renderCourse(fixtures);

    const breadcrumbs = await screen.findByRole('navigation', { name: 'breadcrumb' });
    await waitFor(() => expect(within(breadcrumbs).getAllByTestId('breadcrumb-item')).toHaveLength(2));
    expect(within(breadcrumbs).getByRole('link', { name: 'Course' }))
      .toHaveAttribute('href', `/learning/course/${fixtures.courseId}/home`);
    expect(within(breadcrumbs).getByRole('link', { name: fixtures.sectionBlocks[0].display_name }))
      .toHaveAttribute('href', unitPath(fixtures.courseId, fixtures.sequenceId));
    expect(within(breadcrumbs).getByRole('link', { name: fixtures.sequenceBlocks[0].display_name }))
      .toHaveAttribute('href', unitPath(fixtures.courseId, fixtures.sequenceId));
    expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
  });

  it('does not error while the outline is loading', async () => {
    addSlotOperations([courseBreadcrumbsSlotOperation]);
    const fixtures = mockCourseRequests();
    // The same matcher as mockCourseRequests', so it takes that handler's place.
    fixtures.axiosMock.onGet(new RegExp(`${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`))
      .reply(() => new Promise(() => {}));
    renderCourse(fixtures);

    // The section and sequence items are there, with no titles until the outline arrives.
    const breadcrumbs = await screen.findByRole('navigation', { name: 'breadcrumb' });
    expect(within(breadcrumbs).getByRole('link', { name: 'Course' })).toBeInTheDocument();
    within(breadcrumbs).getAllByTestId('breadcrumb-item').forEach((item) => expect(item).toHaveTextContent(''));
    expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
  });

  it('gives staff a jump navigation menu when the jumpNav option is on', async () => {
    const user = userEvent.setup();
    addSlotOperations([courseBreadcrumbsSlotOperation]);
    enableJumpNav();
    const fixtures = mockTwoSectionCourse({ isStaff: true });
    const { router } = renderCourse(fixtures);

    const breadcrumbs = await screen.findByRole('navigation', { name: 'breadcrumb' });
    const sectionButton = await within(breadcrumbs).findByRole('button', { name: fixtures.sectionBlocks[0].display_name });
    await user.click(sectionButton);
    await user.click(await screen.findByRole('button', { name: fixtures.sectionBlocks[1].display_name }));

    await waitFor(() => expect(router.state.location.pathname).toEqual(
      unitPath(fixtures.courseId, fixtures.sequenceBlocks[1].id, fixtures.unitId),
    ));
  });

  it('gives staff plain links when the jumpNav option is off', async () => {
    addSlotOperations([courseBreadcrumbsSlotOperation]);
    const fixtures = mockTwoSectionCourse({ isStaff: true });
    renderCourse(fixtures);

    const breadcrumbs = await screen.findByRole('navigation', { name: 'breadcrumb' });
    expect(await within(breadcrumbs).findByRole('link', { name: fixtures.sectionBlocks[0].display_name }))
      .toBeInTheDocument();
    expect(within(breadcrumbs).queryByRole('button')).not.toBeInTheDocument();
  });

  it('gives a learner who is not staff plain links even with the jumpNav option on', async () => {
    addSlotOperations([courseBreadcrumbsSlotOperation]);
    enableJumpNav();
    const fixtures = mockTwoSectionCourse();
    renderCourse(fixtures);

    const breadcrumbs = await screen.findByRole('navigation', { name: 'breadcrumb' });
    expect(await within(breadcrumbs).findByRole('link', { name: fixtures.sectionBlocks[0].display_name }))
      .toBeInTheDocument();
    expect(within(breadcrumbs).queryByRole('button')).not.toBeInTheDocument();
  });
});
