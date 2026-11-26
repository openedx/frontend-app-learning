import { Factory } from 'rosie';
import {
  getAnalyticsService, getAppConfig, getAuthenticatedHttpClient, getSiteConfig,
} from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';
import {
  fireEvent, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { appId } from '@src/constants';
import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { render, renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { sequenceNavigationSlotOperation } from '@src/widgets/SequenceNavigation';
import { appendBrowserTimezoneToUrl } from '@src/utils';

import { TourProvider } from './TourContext';
import ProductTours from './ProductTours';

const { sendTrackEvent } = getAnalyticsService();

const tourDataUrl = `${getSiteConfig().lmsBaseUrl}/api/user_tours/v1/MockUser`;

describe('Course Home Tours', () => {
  let axiosMock;

  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const courseMetadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);
  const outlineUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/outline/${courseId}`;
  const proctoringInfoUrl = `${getAppConfig(appId).EXAMS_BASE_URL}/api/v1/student/course_id/${encodeURIComponent(courseId)}/onboarding?username=MockUser`;

  function setMetadata(attributes) {
    axiosMock.onGet(courseMetadataUrl).reply(200, Factory.build('courseHomeMetadata', attributes));
  }

  function setTourData(tourData, response = 200) {
    axiosMock.onGet(tourDataUrl).reply(response, tourData);
  }

  async function fetchAndRender() {
    const rendered = renderRoutes(routes, `/learning/course/${courseId}/home`);
    // The welcome modal hides the page behind it from the accessibility tree.
    await screen.findByRole('heading', { level: 1, hidden: true });
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    return rendered;
  }

  // The lazy route's first load compiles the whole page, which can outlast findBy's timeout.
  beforeAll(() => import('@src/course-home/outline-tab/OutlineTab'));

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    setMetadata({});
    // A date and the weekly goal card, so every course home anchor renders.
    axiosMock.onGet(outlineUrl).reply(200, Factory.build(
      'outlineTabData',
      { course_goals: { weekly_learning_goal_enabled: true } },
      {
        date_blocks: [{
          date: '2030-08-20T05:59:40.942669Z',
          date_type: 'course-end-date',
          description: '',
          learner_has_access: true,
          title: 'Course ends',
        }],
      },
    ));
    axiosMock.onGet(proctoringInfoUrl).reply(404, {});
    axiosMock.onPatch(tourDataUrl).reply(200, {});
    setTourData({
      course_home_tour_status: 'no-tour',
      show_courseware_tour: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const patches = () => axiosMock.history.patch.map((request) => JSON.parse(request.data));

  describe('for new users', () => {
    beforeEach(async () => {
      setTourData({
        course_home_tour_status: 'show-new-user-tour',
        show_courseware_tour: false,
      });
      await fetchAndRender();
    });

    it('renders modal', async () => {
      expect(await screen.findByRole('dialog', { name: 'New user course home prompt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Begin tour' })).toBeInTheDocument();
      expect(screen.getByText(/Welcome to your/)).toBeInTheDocument();
      // The course home shows a not-enrolled learner an alert it loads lazily: wait for it before the test ends.
      expect(await screen.findByTestId('private-course-alert')).toBeInTheDocument();
    });

    it('renders checkpoint on click of "Begin tour"', async () => {
      const beginTourButton = await screen.findByRole('button', { name: 'Begin tour' });
      fireEvent.click(beginTourButton);

      expect(await screen.findByRole('dialog', { name: 'Take the course!' })).toBeInTheDocument();
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.new_user_tour.started', expect.any(Object));
    });

    it('dismisses the modal and runs the abandon tour on "Skip for now"', async () => {
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.new_user_modal.dismissed', expect.any(Object));
      await waitFor(() => expect(patches()).toEqual([{ course_home_tour_status: 'no-tour' }]));

      // Dismissing the modal enables the abandon tour, anchored to the launch link; ending it clears that flag.
      expect(await screen.findByText(/Feeling lost\?/)).toBeInTheDocument();
      await user.click(await screen.findByRole('button', { name: 'Okay' }));
      await waitFor(() => expect(screen.queryByText(/Feeling lost\?/)).not.toBeInTheDocument());
    });

    it('dismisses the new-user tour on escape', async () => {
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Begin tour' }));
      await screen.findByRole('dialog', { name: 'Take the course!' });

      // The tour's onEscape handler is its onDismiss.
      await user.keyboard('{Escape}');
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.new_user_tour.dismissed', expect.any(Object));
      await waitFor(() => expect(patches()).toEqual(expect.arrayContaining([
        { course_home_tour_status: 'no-tour' },
        { show_courseware_tour: false },
      ])));
    });

    it('completes the new-user tour through its anchored steps', async () => {
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Begin tour' }));
      await screen.findByRole('dialog', { name: 'Take the course!' });

      // Advance through each checkpoint, recording its title, then finish on the last one.
      const titles = [];
      const advanceToEnd = async () => {
        titles.push(document.querySelector('#pgn__checkpoint-title')?.textContent);
        const next = screen.queryByRole('button', { name: 'Next' });
        if (!next) { return; }
        await user.click(next);
        await advanceToEnd();
      };
      await advanceToEnd();

      // Without the shell's course bar the tabs step has no anchor; the upgrade step is gone.
      expect(titles).toEqual(['Take the course!', 'Keep on top of key dates', 'Set a course goal']);

      await user.click(screen.getByRole('button', { name: 'Okay' }));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.new_user_tour.completed', expect.any(Object));
      await waitFor(() => expect(patches()).toEqual([{ course_home_tour_status: 'no-tour' }]));
    });
  });

  describe('the tabs step', () => {
    let courseBar;

    beforeEach(() => {
      // The shell's course bar, which renders outside Learning's routes.
      courseBar = document.createElement('nav');
      courseBar.className = 'course-tabs-navigation';
      document.body.prepend(courseBar);
    });

    afterEach(() => {
      courseBar.remove();
    });

    it('anchors to the shell\'s course bar', async () => {
      setTourData({
        course_home_tour_status: 'show-new-user-tour',
        show_courseware_tour: false,
      });
      await fetchAndRender();
      const user = userEvent.setup();

      await user.click(await screen.findByRole('button', { name: 'Begin tour' }));
      await screen.findByRole('dialog', { name: 'Take the course!' });
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await screen.findByRole('dialog', { name: 'Keep on top of key dates' });
      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(await screen.findByRole('dialog', { name: 'Additional course resources' })).toBeInTheDocument();
    });
  });

  describe('for eligible existing users', () => {
    beforeEach(async () => {
      setTourData({
        course_home_tour_status: 'show-existing-user-tour',
        show_courseware_tour: false,
      });
      await fetchAndRender();
    });

    it('renders correctly', async () => {
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('We’ve recently added a few new features to the course experience.', { exact: false })).toBeInTheDocument();
    });

    it('completes the existing-user tour', async () => {
      const user = userEvent.setup();

      await user.click(await screen.findByRole('button', { name: 'Okay' }));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.existing_user_tour.completed', expect.any(Object));
      await waitFor(() => expect(patches()).toEqual([{ course_home_tour_status: 'no-tour' }]));
    });
  });

  describe('for non-eligible existing users', () => {
    beforeEach(async () => {
      await fetchAndRender();
    });

    it('does not render a tour', async () => {
      await screen.findAllByRole('button', { name: 'Launch tour' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('launches tour on button click', async () => {
      const buttons = await screen.findAllByRole('button', { name: 'Launch tour' });
      // The visible button in the course tools, and the screen-reader-only copy the tab page renders.
      expect(buttons).toHaveLength(2);
      const launchTourButton = buttons.find((button) => !button.classList.contains('sr-only'));
      expect(launchTourButton).toBeInTheDocument();

      fireEvent.click(launchTourButton);

      expect(await screen.findByRole('dialog', { name: 'Take the course!' })).toBeInTheDocument();
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.launch_tour.clicked', expect.objectContaining({
        courserun_key: courseId,
        tour_variant: 'course_home',
      }));
    });
  });

  it.each([401, 403, 404])(
    'does not render tour components for a %s response',
    async (errorStatus) => {
      setTourData({}, errorStatus);
      await fetchAndRender();

      await waitFor(() => expect(axiosMock.history.get.some((request) => request.url === tourDataUrl)).toBe(true));
      expect(screen.queryByRole('button', { name: 'Launch tour' })).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  it('shows no tour while the streak celebration is open', async () => {
    setMetadata({ celebrations: { streak_length_to_celebrate: 3 } });
    setTourData({
      course_home_tour_status: 'show-new-user-tour',
      show_courseware_tour: false,
    });
    await fetchAndRender();

    // The tour data still loads (the launch button shows), but neither the modal nor a checkpoint renders.
    // The streak modal is open, so the page behind it is hidden from the accessibility tree.
    await screen.findAllByRole('button', { name: 'Launch tour', hidden: true });
    expect(screen.queryByRole('dialog', { name: 'New user course home prompt' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Begin tour' })).not.toBeInTheDocument();
    expect(document.querySelector('#pgn__checkpoint')).not.toBeInTheDocument();
  });

  it('does not fetch the tour data on other tabs', async () => {
    const datesUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/dates/${courseId}`;
    axiosMock.onGet(datesUrl).reply(200, Factory.build('datesTabData'));
    renderRoutes(routes, `/learning/course/${courseId}/dates`);

    await screen.findByRole('heading', { level: 1 });
    expect(axiosMock.history.get.some((request) => request.url === tourDataUrl)).toBe(false);
  });
});

describe('Courseware Tour', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    // On page load, the sequence scrolls to the top of the page.
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderUnit = (showCoursewareTour) => {
    const fixtures = mockCourseRequests();
    fixtures.axiosMock.onGet(tourDataUrl).reply(200, {
      course_home_tour_status: 'no-tour',
      show_courseware_tour: showCoursewareTour,
    });
    fixtures.axiosMock.onPatch(tourDataUrl).reply(200, {});
    renderRoutes(routes, unitPath(fixtures.courseId, fixtures.sequenceId, fixtures.unitId));
    return fixtures;
  };

  const waitForTourData = (axiosMock) => waitFor(() => (
    expect(axiosMock.history.get.some((request) => request.url === tourDataUrl)).toBe(true)
  ));

  it('renders nothing on a stock site, where nothing renders its anchor', async () => {
    const { axiosMock } = renderUnit(true);

    await screen.findByTitle(/./, { selector: 'iframe' });
    await waitForTourData(axiosMock);
    expect(document.querySelector('#courseware-sequence-navigation')).not.toBeInTheDocument();
    expect(document.querySelector('#pgn__checkpoint')).not.toBeInTheDocument();
  });

  describe('with the sequence navigation installed', () => {
    beforeEach(() => {
      addSlotOperations([sequenceNavigationSlotOperation]);
    });

    it.each([true, false])(
      'displays the courseware checkpoint only when show_courseware_tour is %s',
      async (showCoursewareTour) => {
        const { axiosMock } = renderUnit(showCoursewareTour);

        await screen.findByTestId('courseware-sequence-navigation');
        await waitForTourData(axiosMock);
        if (showCoursewareTour) {
          expect(await screen.findByText(/The top bar within your course/)).toBeInTheDocument();
        } else {
          expect(document.querySelector('#pgn__checkpoint')).not.toBeInTheDocument();
        }
      },
    );

    it('completes the courseware tour', async () => {
      const { axiosMock } = renderUnit(true);
      const user = userEvent.setup();

      await user.click(await screen.findByRole('button', { name: 'Okay' }));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.courseware_tour.completed', expect.any(Object));
      await waitFor(() => expect(axiosMock.history.patch.map((request) => JSON.parse(request.data)))
        .toEqual([{ show_courseware_tour: false }]));
    });
  });
});

describe('ProductTours guards', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  const renderTours = (props) => render(
    <TourProvider>
      <ProductTours courseId={courseId} org="edX" {...props} />
    </TourProvider>,
  );

  it('renders nothing during a streak celebration', () => {
    renderTours({ activeTab: 'outline', isStreakCelebrationOpen: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show a tour on non-tour tabs', () => {
    renderTours({ activeTab: 'dates', isStreakCelebrationOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
