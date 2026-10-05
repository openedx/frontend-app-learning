import React from 'react';

import { Factory } from 'rosie';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';

import {
  cleanup, fireEvent, getByRole, loadUnit, mockCourseRequests, render, screen, waitFor,
} from '../../setupTest';
import initializeStore from '../../store';
import MountCourseQueryHooks from '../../tests/MountCourseQueryHooks';
import * as celebrationUtils from './celebration/utils';
import { handleNextSectionCelebration } from './celebration';
import { testIDs } from './sequence/Unit/ContentIFrame';
import setupDiscussionSidebar, { LoadedCourse } from './test-utils';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-lib-special-exams', () => {
  const actual = jest.requireActual('@edx/frontend-lib-special-exams');
  return {
    ...actual,
    __esModule: true,
    // Mock the default export (SequenceExamWrapper) to just render children
    // eslint-disable-next-line react/prop-types
    default: ({ children }) => <div data-testid="sequence-exam-wrapper">{children}</div>,
  };
});
const mockLearnerToolsTestId = 'fake-learner-tools';
jest.mock(
  '../../plugin-slots/LearnerToolsSlot',
  () => ({
    // eslint-disable-next-line react/prop-types
    LearnerToolsSlot({ courseId }) {
      return <div className="fake-learner-tools" data-testid={mockLearnerToolsTestId}>LearnerTools contents {courseId} </div>;
    },
  }),
);

const recordFirstSectionCelebration = jest.fn();
// eslint-disable-next-line no-import-assign
celebrationUtils.recordFirstSectionCelebration = recordFirstSectionCelebration;

describe('Course', () => {
  let fixtures;
  const store = initializeStore();
  const mockData = {
    nextSequenceHandler: () => {},
    previousSequenceHandler: () => {},
    unitNavigationHandler: () => {},
  };

  const renderCourse = (testData) => render(
    <MemoryRouter initialEntries={[`/course/${testData.courseId}/${testData.sequenceId}/${testData.unitId}`]}>
      <Routes>
        <Route
          path="/course/:courseId/:sequenceId/*"
          element={(
            <>
              <MountCourseQueryHooks courseId={testData.courseId} sequenceId={testData.sequenceId} />
              <LoadedCourse {...testData} />
            </>
          )}
        />
      </Routes>
    </MemoryRouter>,
    { store },
  );

  beforeAll(() => {
    fixtures = mockCourseRequests();
    const { courseId, sequenceId, unitId } = fixtures;
    Object.assign(mockData, { courseId, sequenceId, unitId });
  });

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
  });

  it('loads learning sequence', async () => {
    renderCourse(mockData);
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

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

    expect(document.title).toMatch(
      `${sequenceBlocks[0].display_name} | ${sectionBlocks[0].display_name} | ${courseMetadata.name} | edX`,
    );
  });

  it('removes breadcrumbs when navigation is disabled', async () => {
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: [] },
      { courseId: mockData.courseId },
    )];
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { navigation_disabled: true },
      { courseId: mockData.courseId, sequenceBlock: sequenceBlocks[0] },
    )];
    mockCourseRequests({ sequenceBlocks, sequenceMetadata });
    const testData = {
      ...mockData,
      sequenceId: sequenceBlocks[0].id,
      onNavigate: jest.fn(),
    };
    renderCourse(testData);
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
  });

  it('displays first section celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { firstSection: true } });
    const { courseId, sequenceId, unitId } = mockCourseRequests({ courseHomeMetadata });
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId,
    };
    // Set up LocalStorage for testing.
    handleNextSectionCelebration(sequenceId, sequenceId, testData.unitId);
    renderCourse(testData);

    const firstSectionCelebrationModal = await screen.findByRole('dialog');
    expect(getByRole(firstSectionCelebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
  });

  it('displays weekly goal celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { weeklyGoal: true } });
    const { courseId, sequenceId, unitId } = mockCourseRequests({ courseHomeMetadata });
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId,
    };
    renderCourse(testData);

    const weeklyGoalCelebrationModal = await screen.findByRole('dialog');
    expect(getByRole(weeklyGoalCelebrationModal, 'heading', { name: 'You met your goal!' })).toBeInTheDocument();
  });

  describe('sidebar behavior', () => {
    let testData;

    beforeEach(async () => {
      // setupDiscussionSidebar mocks the course requests with the openedx discussion provider.
      // The render it does is incidental — clean it up so each test renders fresh.
      const { courseId, sequenceId, unitId } = await setupDiscussionSidebar();
      cleanup();
      testData = {
        ...mockData,
        courseId,
        sequenceId,
        unitId,
      };
      global.innerWidth = breakpoints.extraExtraLarge.minWidth;
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    it('opens the course outline on render when no preference is stored and the user has not closed the sidebar', async () => {
      renderCourse(testData);
      loadUnit();

      await waitFor(() => {
        expect(document.querySelector('nav.outline-sidebar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
    });

    it('exposes the course outline sidebar as a navigation landmark with an accessible name', async () => {
      render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
      loadUnit();

      const outlineNav = await screen.findByRole('navigation', { name: /course outline/i });
      expect(outlineNav).toHaveClass('outline-sidebar');
    });

    it('renders the primary content inside <main id="main-content"> with the sidebar navigation kept outside of it', async () => {
      render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
      loadUnit();

      const outlineNav = await screen.findByRole('navigation', { name: /course outline/i });
      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe('MAIN');
      expect(main).toHaveClass('sequence');
      // Sidebar landmark must not be nested inside <main>.
      expect(main).not.toContainElement(outlineNav);
    });

    it('keeps the sidebar closed on render when the user previously closed it', async () => {
      window.sessionStorage.setItem('sidebarClosedByUser', 'true');
      renderCourse(testData);
      loadUnit();

      await waitFor(() => {
        // The Provider's topics query resolves; assert nothing has opened in response.
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
      });
      expect(document.querySelector('nav.outline-sidebar')).not.toBeInTheDocument();
    });

    it('opens discussions on render when it is the stored preference', async () => {
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('DISCUSSIONS'));
      renderCourse(testData);
      loadUnit();

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });
      expect(document.querySelector('nav.outline-sidebar')).not.toBeInTheDocument();
    });

    it('opens the course outline on render when it is the stored preference', async () => {
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('COURSE_OUTLINE'));
      renderCourse(testData);
      loadUnit();

      await waitFor(() => {
        expect(document.querySelector('nav.outline-sidebar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
    });

    it('closes the course outline when the user clicks its trigger', async () => {
      const user = userEvent.setup();
      renderCourse(testData);
      loadUnit();
      await waitFor(() => {
        expect(document.querySelector('nav.outline-sidebar')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Toggle course outline tray/i }));

      await waitFor(() => {
        expect(document.querySelector('nav.outline-sidebar')).not.toBeInTheDocument();
      });
    });

    it('opens the course outline when the user clicks its trigger, closing discussions if open', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('DISCUSSIONS'));
      renderCourse(testData);
      loadUnit();
      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Toggle course outline tray/i }));

      await waitFor(() => {
        expect(document.querySelector('nav.outline-sidebar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
    });

    it('opens discussions when the user clicks its trigger, closing the outline', async () => {
      const user = userEvent.setup();
      renderCourse(testData);
      loadUnit();
      await waitFor(() => {
        expect(document.querySelector('nav.outline-sidebar')).toBeInTheDocument();
      });

      await user.click(await screen.findByRole('button', { name: /Show discussions tray/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });
      expect(document.querySelector('nav.outline-sidebar')).not.toBeInTheDocument();
    });

    it('closes discussions when the user clicks its trigger', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('DISCUSSIONS'));
      renderCourse(testData);
      loadUnit();
      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Show discussions tray/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
      });
    });
  });

  it('doesn\'t renders course breadcrumbs by default', async () => {
    global.innerWidth = breakpoints.extraLarge.minWidth;

    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const {
      courseId, sequenceId, sectionBlocks, sequenceBlocks,
    } = mockCourseRequests({ courseMetadata, unitBlocks });
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: unitBlocks[1].id, // Corner cases are already covered in `Sequence` tests.
    };
    renderCourse(testData);

    // loadUnit()'s window message is lost unless the unit's listener is registered first.
    await screen.findByTestId(testIDs.contentIFrame);
    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    });
    // expect the section and sequence "titles" not to be loaded in as breadcrumb labels.
    await waitFor(() => {
      expect(screen.queryByText(sectionBlocks[0].display_name)).not.toBeInTheDocument();
      expect(screen.queryByText(sequenceBlocks[0].display_name)).not.toBeInTheDocument();
    });
  });

  it('passes handlers to the sequence', async () => {
    const nextSequenceHandler = jest.fn();
    const previousSequenceHandler = jest.fn();
    const unitNavigationHandler = jest.fn();

    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const { courseId, sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: unitBlocks[1].id, // Corner cases are already covered in `Sequence` tests.
      nextSequenceHandler,
      previousSequenceHandler,
      unitNavigationHandler,
    };
    renderCourse(testData);

    await screen.findByTestId(testIDs.contentIFrame);
    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
      screen.getAllByRole('link', { name: /previous/i }).forEach(link => fireEvent.click(link));
      screen.getAllByRole('link', { name: /next/i }).forEach(link => fireEvent.click(link));

      // We are in the middle of the sequence, so no
      expect(previousSequenceHandler).not.toHaveBeenCalled();
      expect(nextSequenceHandler).not.toHaveBeenCalled();
      expect(unitNavigationHandler).toHaveBeenCalledTimes(4);
    });
  });

  describe('Sequence alerts display', () => {
    it('renders banner text alert', async () => {
      const courseMetadata = Factory.build('courseMetadata');
      const sequenceBlocks = [Factory.build('block', { type: 'sequential', banner_text: 'Some random banner text to display.' })];
      const sequenceMetadata = [Factory.build(
        'sequenceMetadata',
        { banner_text: sequenceBlocks[0].banner_text },
        { courseId: courseMetadata.id, sequenceBlock: sequenceBlocks[0] },
      )];

      mockCourseRequests({ courseMetadata, sequenceBlocks, sequenceMetadata });
      const testData = {
        ...mockData,
        courseId: courseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      renderCourse(testData);
      expect(await screen.findByText('Some random banner text to display.')).toBeInTheDocument();
    });

    it('renders Entrance Exam alert with passing score', async () => {
      const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@entrance_exam';
      const testCourseMetadata = Factory.build('courseMetadata', {
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
        { courseId: testCourseMetadata.id },
      )];
      const sectionBlocks = [Factory.build(
        'block',
        { type: 'chapter', children: sequenceBlocks.map(block => block.id), id: sectionId },
        { courseId: testCourseMetadata.id },
      )];

      mockCourseRequests({ courseMetadata: testCourseMetadata, sequenceBlocks, sectionBlocks });
      const testData = {
        ...mockData,
        courseId: testCourseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      renderCourse(testData);
      expect(await screen.findByText('Your score is 100%. You have passed the entrance exam.')).toBeInTheDocument();
    });

    it('renders Entrance Exam alert with non-passing score', async () => {
      const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@entrance_exam';
      const testCourseMetadata = Factory.build('courseMetadata', {
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
        { courseId: testCourseMetadata.id },
      )];
      const sectionBlocks = [Factory.build(
        'block',
        { type: 'chapter', children: sequenceBlocks.map(block => block.id), id: sectionId },
        { courseId: testCourseMetadata.id },
      )];

      mockCourseRequests({ courseMetadata: testCourseMetadata, sequenceBlocks, sectionBlocks });
      const testData = {
        ...mockData,
        courseId: testCourseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      renderCourse(testData);
      expect(await screen.findByText('To access course materials, you must score 70% or higher on this exam. Your current score is 30%.')).toBeInTheDocument();
    });
  });

  it('displays learner tools when screen is wide enough (browser)', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      enrollment: { mode: 'verified' },
    });
    const { courseId, sequenceId, unitId } = mockCourseRequests({ courseMetadata });
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId,
    };
    renderCourse(testData);

    expect(await screen.findByTestId(mockLearnerToolsTestId)).toBeInTheDocument();
  });

  it('does not display learner tools when screen is too narrow (mobile)', async () => {
    global.innerWidth = breakpoints.extraSmall.maxWidth;
    const courseMetadata = Factory.build('courseMetadata', {
      enrollment: { mode: 'verified' },
    });
    const { courseId, sequenceId, unitId } = mockCourseRequests({ courseMetadata });
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId,
    };
    renderCourse(testData);
    await screen.findByText('Loading learning sequence...');

    expect(screen.queryByTestId(mockLearnerToolsTestId)).not.toBeInTheDocument();
  });
});
