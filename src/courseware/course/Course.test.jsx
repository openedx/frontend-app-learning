import React from 'react';
import { Factory } from 'rosie';
import {
  loadUnit, render, screen, waitFor, getByRole, initializeTestStore, fireEvent,
} from '../../setupTest';
import Course from './Course';
import { handleNextSectionCelebration } from './celebration';
import * as celebrationUtils from './celebration/utils';
import useWindowSize from '../../generic/tabs/useWindowSize';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('./NotificationTray', () => () => <div data-testid="NotificationTray" />);
jest.mock('../../generic/tabs/useWindowSize');
useWindowSize.mockReturnValue({ width: 1200 });

const recordFirstSectionCelebration = jest.fn();
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
  });

  afterAll(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('loads learning sequence', async () => {
    render(<Course {...mockData} />);
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
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { firstSection: true } });
    const testStore = await initializeTestStore({ courseMetadata }, false);
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
    render(<Course {...testData} />, { store: testStore });

    const firstSectionCelebrationModal = screen.getByRole('dialog');
    expect(firstSectionCelebrationModal).toBeInTheDocument();
    expect(getByRole(firstSectionCelebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
  });

  it('displays weekly goal celebration modal', async () => {
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { weeklyGoal: true } });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    render(<Course {...testData} />, { store: testStore });

    const weeklyGoalCelebrationModal = screen.getByRole('dialog');
    expect(weeklyGoalCelebrationModal).toBeInTheDocument();
    expect(getByRole(weeklyGoalCelebrationModal, 'heading', { name: 'You met your goal!' })).toBeInTheDocument();
  });

  it('displays notification trigger and toggles active class on click', async () => {
    useWindowSize.mockReturnValue({ width: 1200 });
    render(<Course {...mockData} />);

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });

    expect(notificationTrigger).toBeInTheDocument();
    expect(notificationTrigger).toHaveClass('trigger-active');
    fireEvent.click(notificationTrigger);
    expect(notificationTrigger).not.toHaveClass('trigger-active');
  });

  it('handles click to open/close notification tray', async () => {
    sessionStorage.clear();
    render(<Course {...mockData} />);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"open"');
    const notificationShowButton = await screen.findByRole('button', { name: /Show notification tray/i });
    expect(screen.queryByTestId('NotificationTray')).toBeInTheDocument();
    fireEvent.click(notificationShowButton);
    expect(sessionStorage.getItem(`notificationTrayStatus.${mockData.courseId}`)).toBe('"closed"');
    expect(screen.queryByTestId('NotificationTray')).not.toBeInTheDocument();
  });

  it('handles reload persisting notification tray status', async () => {
    sessionStorage.clear();
    render(<Course {...mockData} />);
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

    render(<Course {...mockData} />);
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
    render(<Course {...testData} />, { store: testStore });

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
    render(<Course {...testData} />, { store: testStore });

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));
    screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));

    // We are in the middle of the sequence, so no
    expect(previousSequenceHandler).not.toHaveBeenCalled();
    expect(nextSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).toHaveBeenCalledTimes(4);
  });
});
