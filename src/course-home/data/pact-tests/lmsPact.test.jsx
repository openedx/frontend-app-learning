import { Pact, Matchers } from '@pact-foundation/pact';
import path from 'path';
import { mergeConfig, getConfig } from '@edx/frontend-platform';

import {
  getCourseHomeCourseMetadata,
  getDatesTabData,
} from '../api';

import { initializeMockApp } from '../../../setupTest';
import {
  courseId, dateRegex, opaqueKeysRegex, dateTypeRegex,
} from '../../../pacts/constants';

const {
  somethingLike: like, term, boolean, string, eachLike,
} = Matchers;
const provider = new Pact({
  consumer: 'frontend-app-learning',
  provider: 'lms',
  log: path.resolve(process.cwd(), 'src/course-home/data/pact-tests/logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'src/pacts'),
  pactfileWriteMode: 'merge',
  logLevel: 'DEBUG',
  cors: true,
});

describe('Course Home Service', () => {
  beforeAll(async () => {
    initializeMockApp();
    await provider
      .setup()
      .then((options) => mergeConfig({
        LMS_BASE_URL: `http://localhost:${options.port}`,
      }, 'Custom app config for pact tests'));
  });

  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());
  describe('When a request to fetch tab is made', () => {
    it('returns tab data for a course_id', async () => {
      await provider.addInteraction({
        state: `Tab data exists for course_id ${courseId}`,
        uponReceiving: 'a request to fetch tab',
        withRequest: {
          method: 'GET',
          path: `/api/course_home/course_metadata/${courseId}`,
        },
        willRespondWith: {
          status: 200,
          body: {
            can_show_upgrade_sock: boolean(false),
            verified_mode: like({
              access_expiration_date: null,
              currency: 'USD',
              currency_symbol: '$',
              price: 149,
              sku: '8CF08E5',
              upgrade_url: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
            }),
            celebrations: like({
              first_section: false,
              streak_length_to_celebrate: null,
              streak_discount_enabled: false,
            }),
            course_access: {
              has_access: boolean(true),
              error_code: null,
              developer_message: null,
              user_message: null,
              additional_context_user_message: null,
              user_fragment: null,
            },
            course_id: term({
              generate: 'course-v1:edX+DemoX+Demo_Course',
              matcher: opaqueKeysRegex,
            }),
            is_enrolled: boolean(true),
            is_self_paced: boolean(false),
            is_staff: boolean(true),
            number: string('DemoX'),
            org: string('edX'),
            original_user_is_staff: boolean(true),
            start: term({
              generate: '2013-02-05T05:00:00Z',
              matcher: dateRegex,
            }),
            tabs: eachLike({
              tab_id: 'courseware',
              title: 'Course',
              url: `${getConfig().BASE_URL}/course/course-v1:edX+DemoX+Demo_Course/home`,
            }),
            title: string('Demonstration Course'),
            username: string('edx'),
          },
        },
      });
      const normalizedTabData = {
        canShowUpgradeSock: false,
        verifiedMode: {
          accessExpirationDate: null,
          currency: 'USD',
          currencySymbol: '$',
          price: 149,
          sku: '8CF08E5',
          upgradeUrl: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
        },
        celebrations: {
          firstSection: false,
          streakLengthToCelebrate: null,
          streakDiscountEnabled: false,
        },
        courseAccess: {
          hasAccess: true,
          errorCode: null,
          developerMessage: null,
          userMessage: null,
          additionalContextUserMessage: null,
          userFragment: null,
        },
        courseId: 'course-v1:edX+DemoX+Demo_Course',
        isEnrolled: true,
        isMasquerading: false,
        isSelfPaced: false,
        isStaff: true,
        number: 'DemoX',
        org: 'edX',
        originalUserIsStaff: true,
        start: '2013-02-05T05:00:00Z',
        tabs: [
          {
            slug: 'outline',
            title: 'Course',
            url: `${getConfig().BASE_URL}/course/course-v1:edX+DemoX+Demo_Course/home`,
          },
        ],
        title: 'Demonstration Course',
        username: 'edx',
      };
      const response = await getCourseHomeCourseMetadata(courseId, 'outline');
      expect(response).toBeTruthy();
      expect(response).toEqual(normalizedTabData);
    });
  });

  describe('When a request to fetch dates tab is made', () => {
    it('returns course date blocks for a course_id', async () => {
      await provider.addInteraction({
        state: `course date blocks exist for course_id ${courseId}`,
        uponReceiving: 'a request to fetch dates tab',
        withRequest: {
          method: 'GET',
          path: `/api/course_home/dates/${courseId}`,
        },
        willRespondWith: {
          status: 200,
          body: {
            dates_banner_info: like({
              missed_deadlines: false,
              content_type_gating_enabled: false,
              missed_gated_content: false,
              verified_upgrade_link: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
            }),
            course_date_blocks: eachLike({
              assignment_type: null,
              complete: null,
              date: term({
                generate: '2013-02-05T05:00:00Z',
                matcher: dateRegex,
              }),
              date_type: term({
                generate: 'verified-upgrade-deadline',
                matcher: dateTypeRegex,
              }),
              description: 'You are still eligible to upgrade to a Verified Certificate! Pursue it to highlight the knowledge and skills you gain in this course.',
              learner_has_access: true,
              link: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
              link_text: 'Upgrade to Verified Certificate',
              title: 'Verification Upgrade Deadline',
              extra_info: null,
              first_component_block_id: '',
            }),
            has_ended: boolean(false),
            learner_is_full_access: boolean(true),
            user_timezone: null,
          },
        },
      });
      const camelCaseResponse = {
        datesBannerInfo: {
          missedDeadlines: false,
          contentTypeGatingEnabled: false,
          missedGatedContent: false,
          verifiedUpgradeLink: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
        },
        courseDateBlocks: [
          {
            assignmentType: null,
            complete: null,
            date: '2013-02-05T05:00:00Z',
            dateType: 'verified-upgrade-deadline',
            description: 'You are still eligible to upgrade to a Verified Certificate! Pursue it to highlight the knowledge and skills you gain in this course.',
            learnerHasAccess: true,
            link: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
            linkText: 'Upgrade to Verified Certificate',
            title: 'Verification Upgrade Deadline',
            extraInfo: null,
            firstComponentBlockId: '',
          },
        ],
        hasEnded: false,
        learnerIsFullAccess: true,
        userTimezone: null,
      };

      const response = await getDatesTabData(courseId);
      expect(response).toBeTruthy();
      expect(response).toEqual(camelCaseResponse);
    });
  });
});
