import React from 'react';

import PropTypes from 'prop-types';
import { Factory } from 'rosie';

import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';

import {
  cleanup, fireEvent, getByRole, getTestStoreIds, initializeTestStore, loadUnit, render, screen, waitFor,
} from '../../setupTest';
import { useCourseHomeMeta } from '../../course-home/data/apiHooks';
import MountCourseQueryHooks from '../../tests/MountCourseQueryHooks';
import * as celebrationUtils from './celebration/utils';
import { handleNextSectionCelebration } from './celebration';
import { testIDs } from './sequence/Unit/ContentIFrame';
import Course from './Course';
import setupDiscussionSidebar from './test-utils';

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
  let store;
  const mockData = {
    nextSequenceHandler: () => {},
    previousSequenceHandler: () => {},
    unitNavigationHandler: () => {},
  };

  // LoadedTabPage renders the courseware only once the course-home metadata query has succeeded;
  // Course reads `celebrations` from it on first render, so the tests mount it behind the same gate.
  const LoadedCourse = ({ courseId, ...props }) => (
    useCourseHomeMeta(courseId).isSuccess ? <Course courseId={courseId} {...props} /> : null
  );

  LoadedCourse.propTypes = {
    courseId: PropTypes.string.isRequired,
  };

  const renderCourse = (testData, testStore) => render(
    <>
      <MountCourseQueryHooks courseId={testData.courseId} />
      <LoadedCourse {...testData} />
    </>,
    { store: testStore, wrapWithRouter: true },
  );

  beforeAll(async () => {
    store = await initializeTestStore();
    const { models } = store.getState();
    const { courseId, sequenceId } = getTestStoreIds(store);
    Object.assign(mockData, {
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    });
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

    const { models } = store.getState();
    await screen.findByRole('heading', { name: models.units[mockData.unitId].title });
    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    });

    const sequence = models.sequences[mockData.sequenceId];
    const section = models.sections[sequence.sectionId];
    const course = models.coursewareMeta[mockData.courseId];
    expect(document.title).toMatch(
      `${sequence.title} | ${section.title} | ${course.title} | edX`,
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
    const testStore = await initializeTestStore({ sequenceBlocks, sequenceMetadata }, false);
    const testData = {
      ...mockData,
      sequenceId: sequenceBlocks[0].id,
      onNavigate: jest.fn(),
    };
    renderCourse(testData, testStore);
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
  });

  it('displays first section celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { firstSection: true } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    const { models } = testStore.getState();
    const { courseId, sequenceId } = getTestStoreIds(testStore);
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    // Set up LocalStorage for testing.
    handleNextSectionCelebration(sequenceId, sequenceId, testData.unitId);
    renderCourse(testData, testStore);

    const firstSectionCelebrationModal = await screen.findByRole('dialog');
    expect(getByRole(firstSectionCelebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
  });

  it('displays weekly goal celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { weeklyGoal: true } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    const { models } = testStore.getState();
    const { courseId, sequenceId } = getTestStoreIds(testStore);
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    renderCourse(testData, testStore);

    const weeklyGoalCelebrationModal = await screen.findByRole('dialog');
    expect(getByRole(weeklyGoalCelebrationModal, 'heading', { name: 'You met your goal!' })).toBeInTheDocument();
  });

  describe('sidebar behavior', () => {
    let testStore;
    let testData;

    beforeEach(async () => {
      // setupDiscussionSidebar configures the discussion topics mock + loads
      // topics into a testStore. The render it does is incidental — clean it up
      // so we can render fresh against per-test seeded storage.
      const { testStore: setupStore } = await setupDiscussionSidebar();
      cleanup();
      testStore = setupStore;
      const { models } = testStore.getState();
      const { courseId, sequenceId } = getTestStoreIds(testStore);
      testData = {
        ...mockData,
        courseId,
        sequenceId,
        unitId: Object.values(models.units)[0].id,
      };
      global.innerWidth = breakpoints.extraExtraLarge.minWidth;
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    it('opens the course outline on render when no preference is stored and the user has not closed the sidebar', async () => {
      renderCourse(testData, testStore);
      loadUnit();

      await waitFor(() => {
        expect(document.querySelector('section.outline-sidebar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
    });

    it('keeps the sidebar closed on render when the user previously closed it', async () => {
      window.sessionStorage.setItem('sidebarClosedByUser', 'true');
      renderCourse(testData, testStore);
      loadUnit();

      await waitFor(() => {
        // Discussions prefetch resolves; assert nothing has opened in response.
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
      });
      expect(document.querySelector('section.outline-sidebar')).not.toBeInTheDocument();
    });

    it('opens discussions on render when it is the stored preference', async () => {
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('DISCUSSIONS'));
      renderCourse(testData, testStore);
      loadUnit();

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });
      expect(document.querySelector('section.outline-sidebar')).not.toBeInTheDocument();
    });

    it('opens the course outline on render when it is the stored preference', async () => {
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('COURSE_OUTLINE'));
      renderCourse(testData, testStore);
      loadUnit();

      await waitFor(() => {
        expect(document.querySelector('section.outline-sidebar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
    });

    it('closes the course outline when the user clicks its trigger', async () => {
      const user = userEvent.setup();
      renderCourse(testData, testStore);
      loadUnit();
      await waitFor(() => {
        expect(document.querySelector('section.outline-sidebar')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Toggle course outline tray/i }));

      await waitFor(() => {
        expect(document.querySelector('section.outline-sidebar')).not.toBeInTheDocument();
      });
    });

    it('opens the course outline when the user clicks its trigger, closing discussions if open', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('DISCUSSIONS'));
      renderCourse(testData, testStore);
      loadUnit();
      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Toggle course outline tray/i }));

      await waitFor(() => {
        expect(document.querySelector('section.outline-sidebar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();
    });

    it('opens discussions when the user clicks its trigger, closing the outline', async () => {
      const user = userEvent.setup();
      renderCourse(testData, testStore);
      loadUnit();
      await waitFor(() => {
        expect(document.querySelector('section.outline-sidebar')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Show discussions tray/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      });
      expect(document.querySelector('section.outline-sidebar')).not.toBeInTheDocument();
    });

    it('closes discussions when the user clicks its trigger', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${testData.courseId}`, JSON.stringify('DISCUSSIONS'));
      renderCourse(testData, testStore);
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
    const testStore = await initializeTestStore({
      courseMetadata, unitBlocks,
    }, false);
    const { models } = testStore.getState();
    const { courseId, sequenceId } = getTestStoreIds(testStore);
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
    };
    renderCourse(testData, testStore);

    // loadUnit()'s window message is lost unless the unit's listener is registered first.
    await screen.findByTestId(testIDs.contentIFrame);
    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    });
    // expect the section and sequence "titles" not to be loaded in as breadcrumb labels.
    await waitFor(() => {
      expect(screen.queryByText(Object.values(models.sections)[0].title)).not.toBeInTheDocument();
      expect(screen.queryByText(Object.values(models.sequences)[0].title)).not.toBeInTheDocument();
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
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { models } = testStore.getState();
    const { courseId, sequenceId } = getTestStoreIds(testStore);
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
      nextSequenceHandler,
      previousSequenceHandler,
      unitNavigationHandler,
    };
    renderCourse(testData, testStore);

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

      const testStore = await initializeTestStore({ courseMetadata, sequenceBlocks, sequenceMetadata });
      const testData = {
        ...mockData,
        courseId: courseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      renderCourse(testData, testStore);
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

      const testStore = await initializeTestStore({
        courseMetadata: testCourseMetadata, sequenceBlocks, sectionBlocks,
      });
      const testData = {
        ...mockData,
        courseId: testCourseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      renderCourse(testData, testStore);
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

      const testStore = await initializeTestStore({
        courseMetadata: testCourseMetadata, sequenceBlocks, sectionBlocks,
      });
      const testData = {
        ...mockData,
        courseId: testCourseMetadata.id,
        sequenceId: sequenceBlocks[0].id,
      };
      renderCourse(testData, testStore);
      expect(await screen.findByText('To access course materials, you must score 70% or higher on this exam. Your current score is 30%.')).toBeInTheDocument();
    });
  });

  it('displays learner tools when screen is wide enough (browser)', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      enrollment: { mode: 'verified' },
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    const { models } = testStore.getState();
    const { courseId, sequenceId } = getTestStoreIds(testStore);
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    renderCourse(testData, testStore);

    expect(await screen.findByTestId(mockLearnerToolsTestId)).toBeInTheDocument();
  });

  it('does not display learner tools when screen is too narrow (mobile)', async () => {
    global.innerWidth = breakpoints.extraSmall.maxWidth;
    const courseMetadata = Factory.build('courseMetadata', {
      enrollment: { mode: 'verified' },
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    const { models } = testStore.getState();
    const { courseId, sequenceId } = getTestStoreIds(testStore);
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    renderCourse(testData, testStore);
    await screen.findByText('Loading learning sequence...');

    expect(screen.queryByTestId(mockLearnerToolsTestId)).not.toBeInTheDocument();
  });
});
