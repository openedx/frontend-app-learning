import { Pact, Matchers } from '@pact-foundation/pact';
import path from 'path';
import { mergeConfig, getConfig } from '@edx/frontend-platform';

import {
  getCourseMetadata,
  getLearningSequencesOutline,
  getSequenceMetadata,
  postSequencePosition,
  getBlockCompletion,
  getResumeBlock,
  sendActivationEmail,
} from '../api';

import { initializeMockApp } from '../../../setupTest';
import {
  courseId, dateRegex, opaqueKeysRegex, sequenceId, usageId,
} from '../../../pacts/constants';

const {
  somethingLike: like, term, boolean, string, eachLike, integer,
} = Matchers;
const provider = new Pact({
  consumer: 'frontend-app-learning',
  provider: 'lms',
  log: path.resolve(process.cwd(), 'src/courseware/data/pact-tests/logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'src/pacts'),
  pactfileWriteMode: 'merge',
  logLevel: 'DEBUG',
  cors: true,
});

describe('Courseware Service', () => {
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

  describe('When a request to get a learning sequence outline is made', () => {
    it('returns a normalized outline', async () => {
      await provider.addInteraction({
        state: `Outline exists for course_id ${courseId}`,
        uponReceiving: 'a request to get an outline',
        withRequest: {
          method: 'GET',
          path: `/api/learning_sequences/v1/course_outline/${courseId}`,
        },
        willRespondWith: {
          status: 200,
          body: {
            course_key: string('course-v1:edX+DemoX+Demo_Course'),
            title: string('Demo Course'),
            outline: {
              sections: [],
              sequences: {},
            },
          },
        },
      });
      const normalizedOutline = {
        courses: {
          'course-v1:edX+DemoX+Demo_Course': {
            id: 'course-v1:edX+DemoX+Demo_Course',
            title: 'Demo Course',
            sectionIds: [],
            hasScheduledContent: false,
          },
        },
        sections: {},
        sequences: {},
      };
      const response = await getLearningSequencesOutline(courseId);
      expect(response).toEqual(normalizedOutline);
    });

    it('skips unreleased sequences', async () => {
      await provider.addInteraction({
        state: `Outline exists with unreleased sequences for course_id ${courseId}`,
        uponReceiving: 'a request to get an outline',
        withRequest: {
          method: 'GET',
          path: `/api/learning_sequences/v1/course_outline/${courseId}`,
        },
        willRespondWith: {
          status: 200,
          body: {
            course_key: string('course-v1:edX+DemoX+Demo_Course'),
            title: string('Demo Course'),
            outline: like({
              sections: [
                {
                  id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@partial',
                  title: 'Partially released',
                  sequence_ids: [
                    'block-v1:edX+DemoX+Demo_Course+type@sequential+block@accessible',
                    'block-v1:edX+DemoX+Demo_Course+type@sequential+block@released',
                    'block-v1:edX+DemoX+Demo_Course+type@sequential+block@nope1',
                  ],
                  effective_start: null,
                },
                {
                  id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@nope',
                  title: 'Wholly unreleased',
                  sequence_ids: [
                    'block-v1:edX+DemoX+Demo_Course+type@sequential+block@nope2',
                  ],
                  effective_start: '9999-07-01T17:00:00Z',
                },
              ],
              sequences: {
                'block-v1:edX+DemoX+Demo_Course+type@sequential+block@accessible': {
                  id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@accessible',
                  title: 'Can access',
                  accessible: true,
                  effective_start: '9999-07-01T17:00:00Z',
                },
                'block-v1:edX+DemoX+Demo_Course+type@sequential+block@released': {
                  id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@released',
                  title: 'Released and inaccessible',
                  accessible: false,
                  effective_start: '2019-07-01T17:00:00Z',
                },
                'block-v1:edX+DemoX+Demo_Course+type@sequential+block@nope1': {
                  id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@nope1',
                  title: 'Unreleased',
                  accessible: false,
                  effective_start: '9999-07-01T17:00:00Z',
                },
                'block-v1:edX+DemoX+Demo_Course+type@sequential+block@nope2': {
                  id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@nope2',
                  title: 'Still unreleased',
                  accessible: false,
                  effective_start: '9999-07-01T17:00:00Z',
                },
              },
            }),
          },
        },
      });
      const normalizedOutline = {
        courses: {
          'course-v1:edX+DemoX+Demo_Course': {
            id: 'course-v1:edX+DemoX+Demo_Course',
            title: 'Demo Course',
            sectionIds: [
              'block-v1:edX+DemoX+Demo_Course+type@chapter+block@partial',
            ],
            hasScheduledContent: true,
          },
        },
        sections: {
          'block-v1:edX+DemoX+Demo_Course+type@chapter+block@partial': {
            id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@partial',
            title: 'Partially released',
            courseId: 'course-v1:edX+DemoX+Demo_Course',
            sequenceIds: [
              'block-v1:edX+DemoX+Demo_Course+type@sequential+block@accessible',
              'block-v1:edX+DemoX+Demo_Course+type@sequential+block@released',
            ],
          },
        },
        sequences: {
          'block-v1:edX+DemoX+Demo_Course+type@sequential+block@accessible': {
            id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@accessible',
            title: 'Can access',
            sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@partial',
          },
          'block-v1:edX+DemoX+Demo_Course+type@sequential+block@released': {
            id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@released',
            title: 'Released and inaccessible',
            sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@partial',
          },
        },
      };
      const response = await getLearningSequencesOutline(courseId);
      expect(response).toEqual(normalizedOutline);
    });
  });

  describe('When a request to get course metadata is made', () => {
    it('returns normalized course metadata', async () => {
      await provider.addInteraction({
        state: `course metadata exists for course_id ${courseId}`,
        uponReceiving: 'a request to get course metadata',
        withRequest: {
          method: 'GET',
          path: `/api/courseware/course/${courseId}`,
          query: {
            browser_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            access_expiration: {
              expiration_date: term({
                generate: '2013-02-05T05:00:00Z',
                matcher: dateRegex,
              }),
              masquerading_expired_course: boolean(false),
              upgrade_deadline: term({
                generate: '2013-02-05T05:00:00Z',
                matcher: dateRegex,
              }),
              upgrade_url: string('link'),
            },
            can_show_upgrade_sock: boolean(false),
            content_type_gating_enabled: boolean(false),
            end: term({
              generate: '2013-02-05T05:00:00Z',
              matcher: dateRegex,
            }),
            enrollment: {
              mode: term({
                generate: 'audit',
                matcher: '^(audit|verified)$',
              }),
              is_active: boolean(true),
            },
            enrollment_start: term({
              generate: '2013-02-05T05:00:00Z',
              matcher: dateRegex,
            }),
            enrollment_end: term({
              generate: '2013-02-05T05:00:00Z',
              matcher: dateRegex,
            }),
            id: term({
              generate: 'course-v1:edX+DemoX+Demo_Course',
              matcher: opaqueKeysRegex,
            }),
            license: string('all-rights-reserved'),
            name: like('Demonstration Course'),
            offer: {
              code: string('code'),
              expiration_date: term({
                generate: '2013-02-05T05:00:00Z',
                matcher: dateRegex,
              }),
              original_price: string('$99'),
              discounted_price: string('$99'),
              percentage: integer(50),
              upgrade_url: string('url'),
            },
            related_programs: null,
            short_description: like(''),
            start: term({
              generate: '2013-02-05T05:00:00Z',
              matcher: dateRegex,
            }),
            user_timezone: null,
            verified_mode: like({
              access_expiration_date: term({
                generate: '2013-02-05T05:00:00Z',
                matcher: dateRegex,
              }),
              currency: 'USD',
              currency_symbol: '$',
              price: 149,
              sku: '8CF08E5',
              upgrade_url: `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=8CF08E5`,
            }),
            show_calculator: boolean(false),
            original_user_is_staff: boolean(true),
            is_staff: boolean(true),
            course_access: like({
              has_access: true,
              error_code: null,
              developer_message: null,
              user_message: null,
              additional_context_user_message: null,
              user_fragment: null,
            }),
            notes: { enabled: boolean(false), visible: boolean(true) },
            marketing_url: null,
            user_has_passing_grade: boolean(false),
            course_exit_page_is_active: boolean(false),
            certificate_data: {
              cert_status: string('audit_passing'), cert_web_view_url: null, certificate_available_date: null,
            },
            verify_identity_url: null,
            verification_status: string('none'),
            linkedin_add_to_profile_url: null,
            user_needs_integrity_signature: boolean(false),
          },
        },
      });

      const normalizedCourseMetadata = {
        accessExpiration: {
          expirationDate: '2013-02-05T05:00:00Z',
          masqueradingExpiredCourse: false,
          upgradeDeadline: '2013-02-05T05:00:00Z',
          upgradeUrl: 'link',
        },
        canShowUpgradeSock: false,
        contentTypeGatingEnabled: false,
        id: 'course-v1:edX+DemoX+Demo_Course',
        title: 'Demonstration Course',
        offer: {
          code: 'code',
          discountedPrice: '$99',
          expirationDate: '2013-02-05T05:00:00Z',
          originalPrice: '$99',
          percentage: 50,
          upgradeUrl: 'url',
        },
        enrollmentStart: '2013-02-05T05:00:00Z',
        enrollmentEnd: '2013-02-05T05:00:00Z',
        end: '2013-02-05T05:00:00Z',
        start: '2013-02-05T05:00:00Z',
        enrollmentMode: 'audit',
        isEnrolled: true,
        license: 'all-rights-reserved',
        userTimezone: null,
        showCalculator: false,
        notes: { enabled: false, visible: true },
        marketingUrl: null,
        userHasPassingGrade: false,
        courseExitPageIsActive: false,
        certificateData: {
          certStatus: 'audit_passing',
          certWebViewUrl: null,
          certificateAvailableDate: null,
        },
        timeOffsetMillis: 0,
        verifyIdentityUrl: null,
        verificationStatus: 'none',
        linkedinAddToProfileUrl: null,
        relatedPrograms: null,
        userNeedsIntegritySignature: false,
      };
      const response = await getCourseMetadata(courseId);
      expect(response).toBeTruthy();
      expect(response).toEqual(normalizedCourseMetadata);
    });
  });

  describe('When a request to get sequence metadata is made', () => {
    it('returns normalized sequence metadata  ', async () => {
      await provider.addInteraction({
        state: `sequence metadata data exists for sequence_id ${sequenceId}`,
        uponReceiving: 'a request to get sequence metadata',
        withRequest: {
          method: 'GET',
          path: `/api/courseware/sequence/${sequenceId}`,
        },
        willRespondWith: {
          status: 200,
          body: {
            items: eachLike({
              content: '',
              page_title: 'Pointing on a Picture',
              type: 'problem',
              id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2152d4a4aadc4cb0af5256394a3d1fc7',
              bookmarked: false,
              path: 'Example Week 1: Getting Started > Homework - Question Styles > Pointing on a Picture',
              graded: true,
              contains_content_type_gated_content: false,
              href: '',
            }),
            item_id: string('block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions'),
            is_time_limited: boolean(false),
            is_proctored: boolean(false),
            is_hidden_after_due: boolean(false),
            position: null,
            tag: boolean('sequential'),
            banner_text: null,
            save_position: boolean(false),
            show_completion: boolean(false),
            gated_content: like({
              prereq_id: null,
              prereq_url: null,
              prereq_section_name: null,
              gated: false,
              gated_section_name: 'Homework - Question Styles',
            }),
            display_name: boolean('Homework - Question Styles'),
            format: boolean('Homework'),
          },
        },
      });
      const normalizedSequenceMetadata = {
        sequence: {
          id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
          blockType: 'sequential',
          unitIds: [
            'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2152d4a4aadc4cb0af5256394a3d1fc7',
          ],
          bannerText: null,
          format: 'Homework',
          title: 'Homework - Question Styles',
          gatedContent: {
            prereqId: null,
            prereqUrl: null,
            prereqSectionName: null,
            gated: false,
            gatedSectionName: 'Homework - Question Styles',
          },
          isTimeLimited: false,
          isProctored: false,
          isHiddenAfterDue: false,
          activeUnitIndex: 0,
          saveUnitPosition: false,
          showCompletion: false,
          allowProctoringOptOut: undefined,
        },
        units: [{
          id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@2152d4a4aadc4cb0af5256394a3d1fc7',
          sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
          bookmarked: false,
          complete: undefined,
          title: 'Pointing on a Picture',
          contentType: 'problem',
          graded: true,
          containsContentTypeGatedContent: false,
        }],
      };
      const response = await getSequenceMetadata(sequenceId);
      expect(response).toBeTruthy();
      expect(response).toEqual(normalizedSequenceMetadata);
    });
  });

  describe('When a request to set sequence position against Unit Index is made', () => {
    it('returns if the request was success or failure', async () => {
      await provider.addInteraction({
        state: `sequence position data exists for course_id ${courseId}, sequence_id ${sequenceId} and activeUnitIndex 0`,
        uponReceiving: 'a request to set sequence position against activeUnitIndex',
        withRequest: {
          method: 'POST',
          path: `/courses/${courseId}/xblock/${sequenceId}/handler/goto_position`,
          body: { position: 1 }, // Position is 1-indexed on the provider side and 0-indexed in the consumer side.
        },
        willRespondWith: {
          status: 200,
          body: {
            success: boolean(true),
          },
        },
      });
      const response = await postSequencePosition(courseId, sequenceId, 0);
      expect(response).toBeTruthy();
      expect(response).toEqual({ success: true });
    });
  });

  describe('When a request to get completion block is made', () => {
    it('returns the completion status', async () => {
      await provider.addInteraction({
        state: `completion block data exists for course_id ${courseId}, sequence_id ${sequenceId} and usageId ${usageId}`,
        uponReceiving: 'a request to get completion block',
        withRequest: {
          method: 'POST',
          path: `/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`,
          body: { usage_key: usageId },
        },
        willRespondWith: {
          status: 200,
          body: {
            complete: boolean(true),
          },
        },
      });
      const response = await getBlockCompletion(courseId, sequenceId, usageId);
      expect(response).toBeTruthy();
      expect(response).toEqual(true);
    });
  });

  describe('When a request to get resume block is made', () => {
    it('returns block id, section id and unit id of the resume block', async () => {
      await provider.addInteraction({
        state: `Resume block exists for course_id ${courseId}`,
        uponReceiving: 'a request to get Resume block',
        withRequest: {
          method: 'GET',
          path: `/api/courseware/resume/${courseId}`,
        },
        willRespondWith: {
          status: 200,
          body: {
            block_id: string('642fadf46d074aabb637f20af320fb31'),
            section_id: string('642fadf46d074aabb637f20af320fb87'),
            unit_id: string('642fadf46d074aabb637f20af320fb99'),
          },
        },
      });
      const camelCaseResponse = {
        blockId: '642fadf46d074aabb637f20af320fb31',
        sectionId: '642fadf46d074aabb637f20af320fb87',
        unitId: '642fadf46d074aabb637f20af320fb99',
      };
      const response = await getResumeBlock(courseId);
      expect(response).toBeTruthy();
      expect(response).toEqual(camelCaseResponse);
    });
  });

  describe('When a request to send activation email is made', () => {
    it('returns status code 200', async () => {
      await provider.addInteraction({
        state: 'A logged-in user may or may not be active',
        uponReceiving: 'a request to send activation email',
        withRequest: {
          method: 'POST',
          path: '/api/send_account_activation_email',
        },
        willRespondWith: {
          status: 200,
        },
      });
      const response = await sendActivationEmail();
      expect(response).toEqual('');
    });
  });
});
