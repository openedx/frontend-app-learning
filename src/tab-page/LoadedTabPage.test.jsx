import React from 'react';
import { Factory } from 'rosie';
import { initializeTestStore, render, screen } from '../setupTest';
import LoadedTabPage from './LoadedTabPage';

jest.mock('../course-tabs/CourseTabsNavigation', () => () => <div data-testid="CourseTabsNavigation" />);
jest.mock('../instructor-toolbar/InstructorToolbar', () => () => <div data-testid="InstructorToolbar" />);
jest.mock('../shared/streak-celebration/StreakCelebrationModal', () => () => <div data-testid="StreakModal" />);
jest.mock('../product-tours/ProductTours', () => () => <div data-testid="ProductTours" />);

describe('Loaded Tab Page', () => {
  const mockData = { activeTabSlug: 'courseware', metadataModel: 'coursewareMeta' };

  beforeAll(async () => {
    const store = await initializeTestStore({ excludeFetchSequence: true });
    mockData.courseId = store.getState().courseware.courseId;
  });

  it('renders correctly', () => {
    render(<LoadedTabPage {...mockData} />);

    expect(screen.queryByTestId('CourseTabsNavigation')).toBeInTheDocument();
    expect(screen.queryByTestId('InstructorToolbar')).not.toBeInTheDocument();
  });

  it('shows Instructor Toolbar if original user is staff', async () => {
    const courseMetadata = Factory.build('courseMetadata');
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { original_user_is_staff: true });
    const testStore = await initializeTestStore(
      {
        courseMetadata,
        courseHomeMetadata,
        excludeFetchSequence: true,
      },
      false,
    );
    render(<LoadedTabPage {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    expect(screen.getByTestId('InstructorToolbar')).toBeInTheDocument();
  });

  it('shows streak celebration modal', async () => {
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { streakLengthToCelebrate: 3 } });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<LoadedTabPage {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    expect(screen.getByTestId('StreakModal')).toBeInTheDocument();
  });
});
