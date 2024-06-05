import React from 'react';

import { Factory } from 'rosie';

import { breakpoints } from '@openedx/paragon';

import {
  fireEvent, getByRole, initializeTestStore, loadUnit, render, screen, waitFor,
} from '../../setupTest';
import * as celebrationUtils from './celebration/utils';
import { handleNextSectionCelebration } from './celebration';
import Course from './Course';
import setupDiscussionSidebar from './test-utils';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-lib-special-exams/dist/data/thunks.js', () => ({
  ...jest.requireActual('@edx/frontend-lib-special-exams/dist/data/thunks.js'),
  checkExamEntry: () => jest.fn(),
}));
const mockChatTestId = 'fake-chat';
jest.mock(
  './chat/Chat',
  // eslint-disable-next-line react/prop-types
  () => function ({ courseId }) {
    return <div className="fake-chat" data-testid={mockChatTestId}>Chat contents {courseId} </div>;
  },
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

  beforeAll(async () => {
    store = await initializeTestStore();
    const { courseware, models } = store.getState();
    const { courseId, sequenceId } = courseware;
    Object.assign(mockData, {
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    });
    global.innerWidth = breakpoints.extraLarge.minWidth;
  });

  it('loads learning sequence', async () => {
    render(<Course {...mockData} />, { wrapWithRouter: true });
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
    waitFor(() => {
      expect(screen.findByText('Loading learning sequence...')).toBeInTheDocument();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Learn About Verified Certificates' })).not.toBeInTheDocument();

      loadUnit();
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();

      const { models } = store.getState();
      const sequence = models.sequences[mockData.sequenceId];
      const section = models.sections[sequence.sectionId];
      const course = models.coursewareMeta[mockData.courseId];
      expect(document.title).toMatch(
        `${sequence.title} | ${section.title} | ${course.title} | edX`,
      );
    });
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
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
    expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).not.toBeInTheDocument();
  });

  it('displays first section celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { firstSection: true } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    // Set up LocalStorage for testing.
    handleNextSectionCelebration(sequenceId, sequenceId, testData.unitId);
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });

    waitFor(() => {
      const firstSectionCelebrationModal = screen.getByRole('dialog');
      expect(firstSectionCelebrationModal).toBeInTheDocument();
      expect(getByRole(firstSectionCelebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
    });
  });

  it('displays weekly goal celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { weeklyGoal: true } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });

    waitFor(() => {
      const weeklyGoalCelebrationModal = screen.getByRole('dialog');
      expect(weeklyGoalCelebrationModal).toBeInTheDocument();
      expect(getByRole(weeklyGoalCelebrationModal, 'heading', { name: 'You met your goal!' })).toBeInTheDocument();
    });
  });

  it('displays notification trigger and toggles active class on click', async () => {
    render(<Course {...mockData} />, { wrapWithRouter: true });

    waitFor(() => {
      const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });
      expect(notificationTrigger).toBeInTheDocument();
      expect(notificationTrigger.parentNode).not.toHaveClass('sidebar-active', { exact: true });
      fireEvent.click(notificationTrigger);
      expect(notificationTrigger.parentNode).toHaveClass('sidebar-active');
    });
  });

  it('handles click to open/close discussions sidebar', async () => {
    await setupDiscussionSidebar();

    waitFor(() => {
      expect(screen.getByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-DISCUSSIONS')).not.toHaveClass('d-none');

      const discussionsTrigger = screen.getByRole('button', { name: /Show discussions tray/i });
      expect(discussionsTrigger).toBeInTheDocument();
      fireEvent.click(discussionsTrigger);

      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).not.toBeInTheDocument();

      fireEvent.click(discussionsTrigger);

      expect(screen.queryByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
    });
  });

  it('displays discussions sidebar when unit changes', async () => {
    const testStore = await initializeTestStore();
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };

    await setupDiscussionSidebar();

    const { rerender } = render(<Course {...testData} />, { store: testStore });
    loadUnit();

    waitFor(() => {
      expect(screen.findByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      expect(screen.findByTestId('sidebar-DISCUSSIONS')).not.toHaveClass('d-none');
    });

    rerender(null);
  });

  it('handles click to open/close notification tray', async () => {
    await setupDiscussionSidebar();
    waitFor(() => {
      const notificationShowButton = screen.findByRole('button', { name: /Show notification tray/i });
      expect(screen.queryByRole('region', { name: /notification tray/i })).not.toBeInTheDocument();
      fireEvent.click(notificationShowButton);
      expect(screen.queryByRole('region', { name: /notification tray/i })).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: /notification tray/i })).not.toHaveClass('d-none');
    });
  });

  it('renders course breadcrumbs as expected', async () => {
    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const testStore = await initializeTestStore({
      courseMetadata, unitBlocks, enableNavigationSidebar: { enable_navigation_sidebar: false },
    }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
    };
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });

    loadUnit();
    await waitFor(() => {
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    });
    // expect the section and sequence "titles" to be loaded in as breadcrumb labels.
    waitFor(() => {
      expect(screen.findByText(Object.values(models.sections)[0].title)).toBeInTheDocument();
      expect(screen.findByText(Object.values(models.sequences)[0].title)).toBeInTheDocument();
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
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
      nextSequenceHandler,
      previousSequenceHandler,
      unitNavigationHandler,
    };
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });

    loadUnit();
    waitFor(() => {
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
      render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => expect(screen.findByText('Some random banner text to display.')).toBeInTheDocument());
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
      render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => expect(screen.findByText('Your score is 100%. You have passed the entrance exam.')).toBeInTheDocument());
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
      render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => expect(screen.findByText('To access course materials, you must score 70% or higher on this exam. Your current score is 30%.')).toBeInTheDocument());
    });
  });

  it('displays chat when screen is wide enough (browser)', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      learning_assistant_enabled: true,
      enrollment: { mode: 'verified' },
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    const { courseware } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
    };
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
    const chat = screen.queryByTestId(mockChatTestId);
    waitFor(() => expect(chat).toBeInTheDocument());
  });

  it('does not display chat when screen is too narrow (mobile)', async () => {
    global.innerWidth = breakpoints.extraSmall.minWidth;
    const courseMetadata = Factory.build('courseMetadata', {
      learning_assistant_enabled: true,
      enrollment: { mode: 'verified' },
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    const { courseware } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
    };
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });
    const chat = screen.queryByTestId(mockChatTestId);
    await expect(chat).not.toBeInTheDocument();
  });
});
