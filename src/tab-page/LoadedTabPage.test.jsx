import React from 'react';
import { Factory } from 'rosie';
import {
  initializeTestStore,
  render,
  screen,
  waitFor,
} from '../setupTest';
import LoadedTabPage from './LoadedTabPage';

jest.mock('../course-header/CourseTabsNavigation', () => () => <div data-testid="CourseTabsNavigation" />);
jest.mock('../instructor-toolbar/InstructorToolbar', () => () => <div data-testid="InstructorToolbar" />);
jest.mock('../shared/streak-celebration/StreakCelebrationModal', () => () => <div data-testid="StreakModal" />);

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
    const courseMetadata = Factory.build('courseMetadata', { original_user_is_staff: true });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    render(<LoadedTabPage {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    expect(screen.getByTestId('InstructorToolbar')).toBeInTheDocument();
  });

  it('shows streak celebration modal', async () => {
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { streakLengthToCelebrate: 3 } });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<LoadedTabPage {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    expect(screen.getByTestId('StreakModal')).toBeInTheDocument();
  });

  it('adds course-wide scripts/styles to page', async () => {
    const courseWideJs = ['https://testcdn.com/js/test.min.js', 'https://jquery.com/jquery.js'];
    const courseWideCss = ['https://testcdn.com/js/test.min.css', 'https://jquery.com/jquery.css'];

    const courseMetadata = Factory.build('courseMetadata', { course_wide_js: courseWideJs, course_wide_css: courseWideCss });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<LoadedTabPage {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    await waitFor(() => {
      const scripts = Array.from(document.getElementsByTagName('script'));
      const scriptUrls = scripts.filter(s => s.src).map(s => s.src.replace(/\/$/, ''));
      const styles = Array.from(document.getElementsByTagName('link'));
      const styleUrls = styles.filter(s => s.href).map(s => s.href.replace(/\/$/, ''));

      courseWideJs.forEach(js => expect(scriptUrls).toContain(js));
      courseWideCss.forEach(css => expect(styleUrls).toContain(css));
    });
  });
});
