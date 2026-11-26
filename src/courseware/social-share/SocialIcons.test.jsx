import { Factory } from 'rosie';
import {
  getAnalyticsService, getSiteConfig, mergeAppConfig,
} from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { appId } from '@src/constants';
import { handleNextSectionCelebration } from '@src/courseware/course/celebration';
import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { mockLocation } from '@src/tests/location';
import { renderRoutes } from '@src/tests/render';

const { sendTrackEvent } = getAnalyticsService();

// The share buttons render inside the first-section celebration, which is where a learner meets them.
describe('SocialIcons', () => {
  const marketingUrl = 'https://example.com/course/demo';

  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  let windowOpen;

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    global.scrollTo = jest.fn();
    global.localStorage.clear();
    sendTrackEvent.mockClear();
    windowOpen = jest.spyOn(window, 'open').mockReturnValue(null);
  });

  afterEach(() => {
    windowOpen.mockRestore();
    act(() => mergeAppConfig(appId, {
      SOCIAL_UTM_MILESTONE_CAMPAIGN: null,
      TWITTER_HASHTAG: null,
      TWITTER_URL: null,
    }));
  });

  const renderCelebration = async () => {
    const courseMetadata = Factory.build('courseMetadata', { marketing_url: marketingUrl });
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { first_section: true } });
    const fixtures = mockCourseRequests({ courseMetadata, courseHomeMetadata });
    fixtures.axiosMock.onPost(`${getSiteConfig().lmsBaseUrl}/api/courseware/celebration/${fixtures.courseId}`).reply(200);
    handleNextSectionCelebration('previous-sequence', fixtures.sequenceId);
    renderRoutes(routes, unitPath(fixtures.courseId, fixtures.sequenceId, fixtures.unitId));
    const dialog = await screen.findByRole('dialog', { name: 'Congratulations!' });
    return { ...fixtures, dialog };
  };

  // react-share labels each button with its network's name, which hides the legacy app's screen-reader text from the
  // accessible name; the buttons are found by that label.

  // The share URL react-share opens, decoded into its parameters.
  const openedShareParams = () => new URL(windowOpen.mock.calls[0][0]).searchParams;

  it('shares on LinkedIn with the campaign, and tracks the click', async () => {
    mergeAppConfig(appId, { SOCIAL_UTM_MILESTONE_CAMPAIGN: 'edxmilestone' });
    const { courseId, dialog } = await renderCelebration();
    const user = userEvent.setup();

    await user.click(within(dialog).getByRole('button', { name: 'linkedin' }));

    expect(windowOpen).toHaveBeenCalledTimes(1);
    expect(openedShareParams().get('url'))
      .toBe(`${marketingUrl}?utm_campaign=edxmilestone&utm_medium=social&utm_source=linkedin`);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.social_share.clicked', {
      org_key: 'edX',
      courserun_key: courseId,
      course_id: courseId,
      is_staff: false,
      service: 'linkedin',
    });
  });

  it('shares on X with the site account and hashtag when TWITTER_URL is set', async () => {
    mergeAppConfig(appId, { TWITTER_URL: 'https://twitter.com/edXOnline', TWITTER_HASHTAG: 'myedxjourney' });
    const { dialog } = await renderCelebration();
    const user = userEvent.setup();

    await user.click(within(dialog).getByRole('button', { name: 'twitter' }));

    const params = openedShareParams();
    expect(params.get('url')).toBe(`${marketingUrl}?utm_medium=social&utm_source=twitter`);
    expect(params.get('text')).toBe('I’m on my way to completing Demonstration Course online with @edXOnline. What are you spending your time learning?');
    expect(params.get('hashtags')).toBe('myedxjourney');
  });

  it('has no X button when TWITTER_URL is not set', async () => {
    const { dialog } = await renderCelebration();

    expect(within(dialog).getByRole('button', { name: 'linkedin' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'twitter' })).not.toBeInTheDocument();
  });

  it('shares on Facebook quoting the site name', async () => {
    const { dialog } = await renderCelebration();
    const user = userEvent.setup();

    await user.click(within(dialog).getByRole('button', { name: 'facebook' }));

    const params = openedShareParams();
    expect(params.get('u')).toBe(`${marketingUrl}?utm_medium=social&utm_source=facebook`);
    expect(params.get('quote'))
      .toBe(`I’m on my way to completing Demonstration Course online with ${getSiteConfig().siteName}. What are you spending your time learning?`);
  });

  it('shares by email with the subject and body', async () => {
    const { dialog } = await renderCelebration();
    const user = userEvent.setup();
    const location = mockLocation({ href: 'http://localhost/' });

    await user.click(within(dialog).getByRole('button', { name: 'email' }));

    expect(location.href.startsWith('mailto:?')).toBe(true);
    const params = new URLSearchParams(location.href.slice('mailto:?'.length));
    expect(params.get('subject')).toBe(`I'm on my way to completing Demonstration Course online with ${getSiteConfig().siteName}!`);
    expect(params.get('body')).toBe(
      `What are you spending your time learning?\n\n ${marketingUrl}?utm_medium=email&utm_source=email`,
    );
  });
});
