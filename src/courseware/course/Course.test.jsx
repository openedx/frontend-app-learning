import { Factory } from 'rosie';
import {
  getAuthenticatedUser, getSiteConfig, runPageRules, setAuthenticatedUser, WidgetOperationTypes,
} from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';

import { discussionsSidebarRole } from '@src/constants';
import routes from '@src/routes';
import { courseBreadcrumbsSlotId } from '@src/slots/CourseBreadcrumbsSlot';
import { learnerToolsSlotId } from '@src/slots/LearnerToolsSlot';
import { loadUnit, mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { addExternalRoute, addSlotOperations } from '@src/tests/slots';
import { discussionsSidebarWidgetId } from '@src/widgets/DiscussionsSidebar';
import { testIDs } from './sequence/Unit/ContentIFrame';

// The legacy app's celebration cases are in celebration/CelebrationModal.test.jsx.

describe('Course', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    global.scrollTo = jest.fn();
  });

  const renderCourse = ({ courseId, sequenceId, unitId }) => renderRoutes(routes, unitPath(courseId, sequenceId, unitId));

  // A learner tools widget, as a site would append one.
  const addLearnerTools = () => {
    const LearnerTools = jest.fn(({ courseId }) => <div data-testid="fake-learner-tools">LearnerTools contents {courseId}</div>);
    addSlotOperations([{
      slotId: learnerToolsSlotId,
      id: 'org.example.widget.learnerTools',
      op: WidgetOperationTypes.APPEND,
      component: LearnerTools,
    }]);
    return LearnerTools;
  };

  it('loads learning sequence', async () => {
    const fixtures = mockCourseRequests();
    renderCourse(fixtures);
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Learn About Verified Certificates' })).not.toBeInTheDocument();

    const {
      unitBlocks, sequenceBlocks, sectionBlocks, courseMetadata,
    } = fixtures;
    await screen.findByRole('heading', { name: unitBlocks[0].display_name });
    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    });

    await waitFor(() => expect(document.title).toMatch(
      `${sequenceBlocks[0].display_name} | ${sectionBlocks[0].display_name} | ${courseMetadata.name} | ${getSiteConfig().siteName}`,
    ));
  });

  it('reports no page-rule diagnostics', async () => {
    renderCourse(mockCourseRequests());
    await screen.findByTestId(testIDs.contentIFrame);

    expect(runPageRules(document)).toEqual([]);
  });

  it('renders the sequence content in a <main> with no id of its own', async () => {
    renderCourse(mockCourseRequests());
    await screen.findByTestId(testIDs.contentIFrame);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('sequence');
    expect(main).not.toHaveAttribute('id');
  });

  it('removes breadcrumbs when navigation is disabled', async () => {
    const courseId = Factory.build('courseMetadata').id;
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: [] },
      { courseId },
    )];
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { navigation_disabled: true },
      { courseId, sequenceBlock: sequenceBlocks[0] },
    )];
    const fixtures = mockCourseRequests({ sequenceBlocks, sequenceMetadata });
    renderCourse({ ...fixtures, sequenceId: sequenceBlocks[0].id });

    expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
  });

  it('doesn\'t render course breadcrumbs by default', async () => {
    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const fixtures = mockCourseRequests({ courseMetadata, unitBlocks });
    const { sectionBlocks, sequenceBlocks } = fixtures;
    renderCourse({ ...fixtures, unitId: unitBlocks[1].id });

    // loadUnit()'s window message is lost unless the unit's listener is registered first.
    await screen.findByTestId(testIDs.contentIFrame);
    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    });
    // expect the section and sequence "titles" not to be loaded in as breadcrumb labels.
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
    expect(screen.queryByText(sectionBlocks[0].display_name)).not.toBeInTheDocument();
    expect(screen.queryByText(sequenceBlocks[0].display_name)).not.toBeInTheDocument();
  });

  it('passes the breadcrumbs slot what it is about', async () => {
    const Breadcrumbs = jest.fn(() => null);
    addSlotOperations([{
      slotId: courseBreadcrumbsSlotId,
      id: 'org.example.widget.breadcrumbs',
      op: WidgetOperationTypes.APPEND,
      component: Breadcrumbs,
    }]);
    const fixtures = mockCourseRequests();
    renderCourse(fixtures);
    await screen.findByTestId(testIDs.contentIFrame);

    expect(Breadcrumbs).toHaveBeenLastCalledWith(expect.objectContaining({
      courseId: fixtures.courseId,
      sectionId: fixtures.sectionBlocks[0].id,
      sequenceId: fixtures.sequenceId,
      unitId: fixtures.unitId,
      isStaff: false,
    }), {});
  });

  it('checks the unit\'s completion on each move to another unit', async () => {
    const user = userEvent.setup();
    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const fixtures = mockCourseRequests({ courseMetadata, unitBlocks });
    const completionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${fixtures.courseId}/xblock/${fixtures.sequenceId}/handler/get_completion`;
    fixtures.axiosMock.onPost(completionUrl).reply(200, { complete: false });
    const completionRequests = () => fixtures.axiosMock.history.post.filter(request => request.url === completionUrl);
    const { router } = renderCourse({ ...fixtures, unitId: unitBlocks[1].id });

    await screen.findByTestId(testIDs.contentIFrame);
    loadUnit();
    await user.click(await screen.findByRole('link', { name: /next/i }));

    await waitFor(() => expect(router.state.location.pathname).toEqual(
      unitPath(fixtures.courseId, fixtures.sequenceId, unitBlocks[2].id),
    ));
    await waitFor(() => expect(completionRequests()).toHaveLength(1));
  });

  describe('sidebar behavior', () => {
    const outlineNav = () => screen.queryByRole('navigation', { name: 'Course outline' });

    beforeEach(() => {
      global.innerWidth = breakpoints.extraExtraLarge.minWidth;
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    afterEach(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    it('opens the course outline on render when no preference is stored and the user has not closed the sidebar', async () => {
      renderCourse(mockCourseRequests());

      expect(await screen.findByRole('navigation', { name: 'Course outline' })).toHaveClass('outline-sidebar');
    });

    it('keeps the sidebar navigation outside of the sequence <main>', async () => {
      renderCourse(mockCourseRequests());

      const nav = await screen.findByRole('navigation', { name: 'Course outline' });
      const main = screen.getByRole('main');
      expect(main).toHaveClass('sequence');
      expect(main).not.toContainElement(nav);
    });

    it('keeps the sidebar closed on render when the user previously closed it', async () => {
      window.sessionStorage.setItem('sidebarClosedByUser', 'true');
      renderCourse(mockCourseRequests());
      await screen.findByTestId(testIDs.contentIFrame);

      expect(outlineNav()).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Toggle course outline tray' })).toBeInTheDocument();
    });

    it('opens the course outline on render when it is the stored preference', async () => {
      const fixtures = mockCourseRequests();
      window.localStorage.setItem(`sidebar.${fixtures.courseId}`, JSON.stringify('COURSE_OUTLINE'));
      renderCourse(fixtures);

      expect(await screen.findByRole('navigation', { name: 'Course outline' })).toBeInTheDocument();
    });

    it('closes the course outline when the user clicks its trigger, and opens it again', async () => {
      const user = userEvent.setup();
      renderCourse(mockCourseRequests());
      await screen.findByRole('navigation', { name: 'Course outline' });

      await user.click(screen.getByRole('button', { name: 'Toggle course outline tray' }));
      await waitFor(() => expect(outlineNav()).not.toBeInTheDocument());
      expect(window.sessionStorage.getItem('sidebarClosedByUser')).toBe('true');

      await user.click(screen.getByRole('button', { name: 'Toggle course outline tray' }));
      expect(await screen.findByRole('navigation', { name: 'Course outline' })).toBeInTheDocument();
    });

    it('navigates to a unit from the course outline and marks it current', async () => {
      const user = userEvent.setup();
      const courseMetadata = Factory.build('courseMetadata');
      const unitBlocks = Array.from({ length: 2 }).map(() => Factory.build(
        'block',
        { type: 'vertical' },
        { courseId: courseMetadata.id },
      ));
      const fixtures = mockCourseRequests({ courseMetadata, unitBlocks });
      const { router } = renderCourse(fixtures);
      const nav = await screen.findByRole('navigation', { name: 'Course outline' });
      const secondUnit = await within(nav).findByRole('link', { name: new RegExp(unitBlocks[1].display_name) });

      await user.click(secondUnit);

      await waitFor(() => expect(router.state.location.pathname).toEqual(
        unitPath(fixtures.courseId, fixtures.sequenceId, unitBlocks[1].id),
      ));
      await waitFor(() => expect(
        within(nav).getByRole('link', { name: new RegExp(unitBlocks[1].display_name) }).closest('li'),
      ).toHaveClass('bg-info-100'));
    });

    it('opens the course outline from the mobile trigger on a narrow viewport', async () => {
      const user = userEvent.setup();
      global.innerWidth = breakpoints.medium.minWidth;
      renderCourse(mockCourseRequests());
      await screen.findByTestId(testIDs.contentIFrame);
      expect(outlineNav()).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Toggle course outline tray' }));

      expect(await screen.findByRole('navigation', { name: 'Course outline' })).toBeInTheDocument();
    });

    describe('with the discussions sidebar', () => {
      const discussionsPanel = () => screen.queryByTestId(`sidebar-${discussionsSidebarWidgetId}`);
      const discussionsTrigger = () => screen.findByRole('button', { name: 'Show discussions tray' });

      // A course whose units have in-context discussions, on a site that provides the discussions sidebar role.
      const mockDiscussionsCourse = () => {
        addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar');
        return mockCourseRequests({ discussionsProvider: 'openedx' });
      };

      it('opens discussions on render when it is the stored preference, with the discussions app for the unit', async () => {
        const fixtures = mockDiscussionsCourse();
        window.localStorage.setItem(`sidebar.${fixtures.courseId}`, JSON.stringify(discussionsSidebarWidgetId));
        renderCourse(fixtures);

        expect(await screen.findByTitle('Discussions')).toHaveAttribute(
          'src',
          `http://localhost:2002/discussions/sidebar/${fixtures.courseId}/category/${fixtures.unitId}`,
        );
        expect(discussionsPanel()).toBeInTheDocument();
        expect(outlineNav()).not.toBeInTheDocument();
        // The trigger loads lazily too: wait for it, or it can finish loading after the test has ended.
        await discussionsTrigger();
      });

      it('keeps discussions closed on render when the user previously closed the sidebar', async () => {
        window.sessionStorage.setItem('sidebarClosedByUser', 'true');
        renderCourse(mockDiscussionsCourse());

        // The trigger shows once the topics have loaded; nothing opens in response.
        await discussionsTrigger();
        expect(discussionsPanel()).not.toBeInTheDocument();
        expect(outlineNav()).not.toBeInTheDocument();
      });

      it('opens discussions when the user clicks its trigger, closing the outline, and closes it again', async () => {
        const user = userEvent.setup();
        renderCourse(mockDiscussionsCourse());
        await screen.findByRole('navigation', { name: 'Course outline' });

        await user.click(await discussionsTrigger());

        expect(await screen.findByTitle('Discussions')).toBeInTheDocument();
        expect(outlineNav()).not.toBeInTheDocument();

        await user.click(await discussionsTrigger());

        await waitFor(() => expect(discussionsPanel()).not.toBeInTheDocument());
      });

      it('opens the course outline when the user clicks its trigger, closing discussions', async () => {
        const user = userEvent.setup();
        const fixtures = mockDiscussionsCourse();
        window.localStorage.setItem(`sidebar.${fixtures.courseId}`, JSON.stringify(discussionsSidebarWidgetId));
        renderCourse(fixtures);
        await screen.findByTitle('Discussions');

        await user.click(screen.getByRole('button', { name: 'Toggle course outline tray' }));

        expect(await screen.findByRole('navigation', { name: 'Course outline' })).toBeInTheDocument();
        expect(discussionsPanel()).not.toBeInTheDocument();
      });

      it('offers no discussions, and requests no topics, when nothing provides the discussions sidebar role', async () => {
        const fixtures = mockCourseRequests({ discussionsProvider: 'openedx' });
        window.localStorage.setItem(`sidebar.${fixtures.courseId}`, JSON.stringify(discussionsSidebarWidgetId));
        renderCourse(fixtures);
        await screen.findByTestId(testIDs.contentIFrame);

        expect(screen.queryByRole('button', { name: 'Show discussions tray' })).not.toBeInTheDocument();
        expect(discussionsPanel()).not.toBeInTheDocument();
        expect(fixtures.axiosMock.history.get.map(request => request.url))
          .not.toContainEqual(expect.stringContaining('/api/discussion/'));
      });
    });
  });

  describe('Sequence alerts display', () => {
    it('renders banner text alert', async () => {
      const courseMetadata = Factory.build('courseMetadata');
      const sequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', banner_text: 'Some random banner text to display.' },
        { courseId: courseMetadata.id },
      )];
      const sequenceMetadata = [Factory.build(
        'sequenceMetadata',
        { banner_text: sequenceBlocks[0].banner_text },
        { courseId: courseMetadata.id, sequenceBlock: sequenceBlocks[0] },
      )];

      const fixtures = mockCourseRequests({ courseMetadata, sequenceBlocks, sequenceMetadata });
      renderCourse(fixtures);
      expect(await screen.findByText('Some random banner text to display.')).toBeInTheDocument();
    });

    it('renders Entrance Exam alert with passing score', async () => {
      const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@entrance_exam';
      const courseMetadata = Factory.build('courseMetadata', {
        entrance_exam_data: {
          entrance_exam_current_score: 1.0,
          entrance_exam_enabled: true,
          entrance_exam_id: sectionId,
          entrance_exam_minimum_score_pct: 0.7,
          entrance_exam_passed: true,
        },
      });
      const sequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', sectionId },
        { courseId: courseMetadata.id },
      )];
      const sectionBlocks = [Factory.build(
        'block',
        { type: 'chapter', children: sequenceBlocks.map(block => block.id), id: sectionId },
        { courseId: courseMetadata.id },
      )];

      const fixtures = mockCourseRequests({ courseMetadata, sequenceBlocks, sectionBlocks });
      renderCourse(fixtures);
      expect(await screen.findByText('Your score is 100%. You have passed the entrance exam.')).toBeInTheDocument();
    });

    it('renders Entrance Exam alert with non-passing score', async () => {
      const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@entrance_exam';
      const courseMetadata = Factory.build('courseMetadata', {
        entrance_exam_data: {
          entrance_exam_current_score: 0.3,
          entrance_exam_enabled: true,
          entrance_exam_id: sectionId,
          entrance_exam_minimum_score_pct: 0.7,
          entrance_exam_passed: false,
        },
      });
      const sequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', sectionId },
        { courseId: courseMetadata.id },
      )];
      const sectionBlocks = [Factory.build(
        'block',
        { type: 'chapter', children: sequenceBlocks.map(block => block.id), id: sectionId },
        { courseId: courseMetadata.id },
      )];

      const fixtures = mockCourseRequests({ courseMetadata, sequenceBlocks, sectionBlocks });
      renderCourse(fixtures);
      expect(await screen.findByText('To access course materials, you must score 70% or higher on this exam. Your current score is 30%.')).toBeInTheDocument();
    });
  });

  describe('learner tools', () => {
    const originalUser = getAuthenticatedUser();

    afterEach(() => {
      setAuthenticatedUser(originalUser);
    });

    it('displays learner tools when screen is wide enough (browser)', async () => {
      const LearnerTools = addLearnerTools();
      const courseMetadata = Factory.build('courseMetadata', { enrollment: { mode: 'verified' } });
      const fixtures = mockCourseRequests({ courseMetadata });
      renderCourse(fixtures);

      // The slot renders into document.body, outside the page.
      expect(await screen.findByTestId('fake-learner-tools')).toBeInTheDocument();
      expect(LearnerTools).toHaveBeenLastCalledWith({
        courseId: fixtures.courseId,
        sequenceId: fixtures.sequenceId,
        unitId: fixtures.unitId,
        userId: originalUser.userId,
        isStaff: false,
        enrollmentMode: 'verified',
      }, {});
    });

    it('does not display learner tools when screen is too narrow (mobile)', async () => {
      global.innerWidth = breakpoints.extraSmall.maxWidth;
      addLearnerTools();
      const courseMetadata = Factory.build('courseMetadata', { enrollment: { mode: 'verified' } });
      renderCourse(mockCourseRequests({ courseMetadata }));
      await screen.findByText('Loading learning sequence...');

      expect(screen.queryByTestId('fake-learner-tools')).not.toBeInTheDocument();
    });
  });
});
