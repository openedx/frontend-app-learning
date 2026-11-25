import { Factory } from 'rosie';
import { getAnalyticsService, getSiteConfig } from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { handleNextSectionCelebration } from './utils';

const { sendTrackEvent } = getAnalyticsService();

describe('CelebrationModal', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    global.scrollTo = jest.fn();
    global.localStorage.clear();
    sendTrackEvent.mockClear();
  });

  // Mocks a course whose metadata carries `celebrations`, and the LMS endpoint the modals post to.
  const mockCourse = (celebrations) => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations });
    const fixtures = mockCourseRequests({ courseHomeMetadata });
    const celebrationUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/celebration/${fixtures.courseId}`;
    fixtures.axiosMock.onPost(celebrationUrl).reply(200);
    const celebrationPosts = () => fixtures.axiosMock.history.post
      .filter(request => request.url === celebrationUrl)
      .map(request => JSON.parse(request.data));
    return { ...fixtures, celebrationPosts };
  };

  const renderCourse = ({ courseId, sequenceId, unitId }) => renderRoutes(routes, unitPath(courseId, sequenceId, unitId));

  it('opens on landing in the next section, and records the celebration: tells the LMS, marks the first section celebrated in the query, tracks the org', async () => {
    const fixtures = mockCourse({ first_section: true });
    // The container writes this marker when next leaves the first section.
    handleNextSectionCelebration('previous-sequence', fixtures.sequenceId);
    const { queryClient } = renderCourse(fixtures);

    const dialog = await screen.findByRole('dialog', { name: 'Congratulations!' });
    expect(within(dialog).getByText('You just completed the first section of your course.')).toBeInTheDocument();
    await waitFor(() => expect(fixtures.celebrationPosts()).toEqual([{ first_section: false }]));
    expect(queryClient.getQueryData(courseHomeMetaQuery(fixtures.courseId).queryKey).celebrations)
      .toEqual(expect.objectContaining({ firstSection: false }));
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.first_section.opened', {
      org_key: 'edX',
      courserun_key: fixtures.courseId,
      course_id: fixtures.courseId,
      is_staff: false,
    });
  });

  it('closes on its button', async () => {
    const fixtures = mockCourse({ first_section: true });
    handleNextSectionCelebration('previous-sequence', fixtures.sequenceId);
    renderCourse(fixtures);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Keep going' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows no share buttons for a course with no marketing URL', async () => {
    const fixtures = mockCourse({ first_section: true });
    handleNextSectionCelebration('previous-sequence', fixtures.sequenceId);
    renderCourse(fixtures);

    const dialog = await screen.findByRole('dialog', { name: 'Congratulations!' });
    expect(within(dialog).queryByRole('button', { name: /share your progress/i })).not.toBeInTheDocument();
  });

  it('records nothing and stays closed with no marker from the previous section', async () => {
    const fixtures = mockCourse({ first_section: true });
    renderCourse(fixtures);

    await screen.findByRole('heading', { name: fixtures.unitBlocks[0].display_name });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fixtures.celebrationPosts()).toEqual([]);
  });

  it('yields to a pending streak, still marking the first section celebrated', async () => {
    const fixtures = mockCourse({ first_section: true, streak_length_to_celebrate: 3 });
    handleNextSectionCelebration('previous-sequence', fixtures.sequenceId);
    renderCourse(fixtures);

    expect(await screen.findByRole('dialog', { name: '3 day streak' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Congratulations!' })).not.toBeInTheDocument();
    await waitFor(() => expect(fixtures.celebrationPosts()).toEqual([{ first_section: false }]));
  });
});

describe('WeeklyGoalCelebrationModal', () => {
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    global.scrollTo = jest.fn();
    sendTrackEvent.mockClear();
  });

  it('opens with the weekly-goal flag, records the celebration and closes', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { weekly_goal: true } });
    const fixtures = mockCourseRequests({ courseHomeMetadata });
    const celebrationUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/celebration/${fixtures.courseId}`;
    fixtures.axiosMock.onPost(celebrationUrl).reply(200);
    renderRoutes(routes, unitPath(fixtures.courseId, fixtures.sequenceId, fixtures.unitId));
    const user = userEvent.setup();

    const dialog = await screen.findByRole('dialog', { name: 'You met your goal!' });
    // The course metadata factory's learner has a goal of one day a week.
    expect(dialog).toHaveTextContent('Congratulations, you met your learning goal of 1 time a week.');
    await waitFor(() => expect(fixtures.axiosMock.history.post.filter(request => request.url === celebrationUrl)
      .map(request => JSON.parse(request.data))).toEqual([{ weekly_goal: false }]));
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.weekly_goal.opened', {
      org_key: 'edX',
      courserun_key: fixtures.courseId,
      is_staff: false,
    });

    await user.click(within(dialog).getByRole('button', { name: 'Keep it up' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('waits for the next load when a streak is pending', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', {
      celebrations: { weekly_goal: true, streak_length_to_celebrate: 3 },
    });
    const fixtures = mockCourseRequests({ courseHomeMetadata });
    renderRoutes(routes, unitPath(fixtures.courseId, fixtures.sequenceId, fixtures.unitId));

    expect(await screen.findByRole('dialog', { name: '3 day streak' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'You met your goal!' })).not.toBeInTheDocument();
  });
});

// The LMS hands a streak to celebrate to the first request of the day that updates the streak. On a unit page two do:
// the course home metadata, which the celebration is read from, and the courseware metadata.
describe('a streak that comes with the courseware metadata', () => {
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    global.scrollTo = jest.fn();
  });

  it('is celebrated on the unit page, ahead of the weekly goal', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      celebrations: {
        first_section: false, weekly_goal: true, streak_length_to_celebrate: 3, streak_discount_enabled: false,
      },
    });
    const courseHomeMetadata = Factory.build('courseHomeMetadata', {
      celebrations: { weekly_goal: true, streak_length_to_celebrate: null },
    });
    const fixtures = mockCourseRequests({ courseMetadata, courseHomeMetadata });
    renderRoutes(routes, unitPath(fixtures.courseId, fixtures.sequenceId, fixtures.unitId));

    expect(await screen.findByRole('dialog', { name: '3 day streak' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'You met your goal!' })).not.toBeInTheDocument();
  });
});
