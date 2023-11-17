import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { breakpoints } from '@edx/paragon';
import {
  act, fireEvent, getByRole, initializeTestStore, loadUnit, render, screen, waitFor,
} from '../../setupTest';
import { buildTopicsFromUnits } from '../data/__factories__/discussionTopics.factory';
import { handleNextSectionCelebration } from './celebration';
import * as celebrationUtils from './celebration/utils';
import Course from './Course';
import { executeThunk } from '../../utils';
import * as thunks from '../data/thunks';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-lib-special-exams/dist/data/thunks.js', () => ({
  ...jest.requireActual('@edx/frontend-lib-special-exams/dist/data/thunks.js'),
  checkExamEntry: () => jest.fn(),
}));

const recordFirstSectionCelebration = jest.fn();
// eslint-disable-next-line no-import-assign
celebrationUtils.recordFirstSectionCelebration = recordFirstSectionCelebration;

describe('Course', () => {
  let store;
  let getItemSpy;
  let setItemSpy;
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
    getItemSpy = jest.spyOn(Object.getPrototypeOf(window.sessionStorage), 'getItem');
    setItemSpy = jest.spyOn(Object.getPrototypeOf(window.sessionStorage), 'setItem');
    global.innerWidth = breakpoints.extraLarge.minWidth;
  });

  afterAll(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  const setupDiscussionSidebar = async () => {
    const testStore = await initializeTestStore({ provider: 'openedx' });
    const state = testStore.getState();
    const { courseware: { courseId } } = state;
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(200, { provider: 'openedx' });
    const topicsResponse = buildTopicsFromUnits(state.models.units);
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
      .reply(200, topicsResponse);

    await executeThunk(thunks.getCourseDiscussionTopics(courseId), testStore.dispatch);
    const [firstUnitId] = Object.keys(state.models.units);
    mockData.unitId = firstUnitId;
    const [firstSequenceId] = Object.keys(state.models.sequences);
    mockData.sequenceId = firstSequenceId;

    await render(<Course {...mockData} />, { store: testStore, wrapWithRouter: true });
  };

  it('loads learning sequence', async () => {
    render(<Course {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Learn About Verified Certificates' })).not.toBeInTheDocument();

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

    const { models } = store.getState();
    const sequence = models.sequences[mockData.sequenceId];
    const section = models.sections[sequence.sectionId];
    const course = models.coursewareMeta[mockData.courseId];
    expect(document.title).toMatch(
      `${sequence.title} | ${section.title} | ${course.title} | edX`,
    );
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

    const firstSectionCelebrationModal = screen.getByRole('dialog');
    expect(firstSectionCelebrationModal).toBeInTheDocument();
    expect(getByRole(firstSectionCelebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
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

    const weeklyGoalCelebrationModal = screen.getByRole('dialog');
    expect(weeklyGoalCelebrationModal).toBeInTheDocument();
    expect(getByRole(weeklyGoalCelebrationModal, 'heading', { name: 'You met your goal!' })).toBeInTheDocument();
  });

  it('displays notification trigger and toggles active class on click', async () => {
    render(<Course {...mockData} />, { wrapWithRouter: true });

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });
    expect(notificationTrigger).toBeInTheDocument();
    expect(notificationTrigger.parentNode).toHaveClass('mt-3');
    fireEvent.click(notificationTrigger);
    expect(notificationTrigger.parentNode).not.toHaveClass('mt-3', { exact: true });
  });

  it('handles click to open/close discussions sidebar', async () => {
    await setupDiscussionSidebar();
    const discussionsTrigger = await screen.getByRole('button', { name: /Show discussions tray/i });
    const discussionsSideBar = await waitFor(() => screen.findByTestId('sidebar-DISCUSSIONS'));

    expect(discussionsSideBar).not.toHaveClass('d-none');

    await act(async () => {
      fireEvent.click(discussionsTrigger);
    });
    await expect(discussionsSideBar).toHaveClass('d-none');

    await act(async () => {
      fireEvent.click(discussionsTrigger);
    });
    await expect(discussionsSideBar).not.toHaveClass('d-none');
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

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-DISCUSSIONS')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-DISCUSSIONS')).not.toHaveClass('d-none');
    });

    rerender(null);
  });

  it('handles click to open/close notification tray', async () => {
    sessionStorage.clear();
    render(<Course {...mockData} />, { wrapWithRouter: true });
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    const notificationShowButton = await screen.findByRole('button', { name: /Show notification tray/i });
    expect(screen.queryByRole('region', { name: /notification tray/i })).toHaveClass('d-none');
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    expect(screen.queryByRole('region', { name: /notification tray/i })).not.toHaveClass('d-none');
  });

  it('handles reload persisting notification tray status', async () => {
    sessionStorage.clear();
    render(<Course {...mockData} />, { wrapWithRouter: true });
    const notificationShowButton = await screen.findByRole('button', { name: /Show notification tray/i });
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');

    // Mock reload window, this doesn't happen in the Course component,
    // calling the reload to check if the tray remains closed
    const { location } = window;
    delete window.location;
    window.location = { reload: jest.fn() };
    window.location.reload();
    expect(window.location.reload).toHaveBeenCalled();
    window.location = location;
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    expect(screen.queryByTestId('NotificationTray')).not.toBeInTheDocument();
  });

  it('handles sessionStorage from a different course for the notification tray', async () => {
    sessionStorage.clear();
    const courseMetadataSecondCourse = Factory.build('courseMetadata', { id: 'second_course' });

    // set sessionStorage for a different course before rendering Course
    sessionStorage.setItem(`notificationTrayStatus.${courseMetadataSecondCourse.id}`, '"open"');

    render(<Course {...mockData} />, { wrapWithRouter: true });
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    const notificationShowButton = await screen.findByRole('button', { name: /Show notification tray/i });
    fireEvent.click(notificationShowButton);

    // Verify sessionStorage was updated for the original course
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');

    // Verify the second course sessionStorage was not changed
    expect(sessionStorage.getItem(`notificationTrayStatus.${courseMetadataSecondCourse.id}`)).toBe('"open"');
  });

  it('renders course breadcrumbs as expected', async () => {
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
    };
    render(<Course {...testData} />, { store: testStore, wrapWithRouter: true });

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // expect the section and sequence "titles" to be loaded in as breadcrumb labels.
    expect(screen.getByText(Object.values(models.sections)[0].title)).toBeInTheDocument();
    expect(screen.getByText(Object.values(models.sequences)[0].title)).toBeInTheDocument();
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
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    screen.getAllByRole('link', { name: /previous/i }).forEach(link => fireEvent.click(link));
    screen.getAllByRole('link', { name: /next/i }).forEach(link => fireEvent.click(link));

    // We are in the middle of the sequence, so no
    expect(previousSequenceHandler).not.toHaveBeenCalled();
    expect(nextSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).toHaveBeenCalledTimes(4);
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
      await waitFor(() => expect(screen.getByText('Some random banner text to display.')).toBeInTheDocument());
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
      await waitFor(() => expect(screen.getByText('Your score is 100%. You have passed the entrance exam.')).toBeInTheDocument());
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
      await waitFor(() => expect(screen.getByText('To access course materials, you must score 70% or higher on this exam. Your current score is 30%.')).toBeInTheDocument());
    });
  });
});
