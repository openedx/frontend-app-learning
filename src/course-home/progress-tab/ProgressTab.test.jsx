import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@edx/paragon';
import MockAdapter from 'axios-mock-adapter';

import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen, act,
} from '../../setupTest';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';
import * as thunks from '../data/thunks';
import initializeStore from '../../store';
import ProgressTab from './ProgressTab';
import LoadedTabPage from '../../tab-page/LoadedTabPage';
import messages from './grades/messages';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Progress Tab', () => {
  let axiosMock;

  const store = initializeStore();
  const defaultMetadata = Factory.build('courseHomeMetadata');
  const defaultTabData = Factory.build('progressTabData');

  const courseId = defaultMetadata.id;
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const progressUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/progress/*`);
  const masqueradeUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`;

  function setMetadata(attributes, options) {
    const courseMetadata = Factory.build('courseHomeMetadata', attributes, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

  function setTabData(attributes, options) {
    const progressTabData = Factory.build('progressTabData', attributes, options);
    axiosMock.onGet(progressUrl).reply(200, progressTabData);
  }

  async function fetchAndRender() {
    await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
    await act(async () => render(<ProgressTab />, { store }));
  }

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Set defaults for network requests
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onGet(progressUrl).reply(200, defaultTabData);
    axiosMock.onGet(masqueradeUrl).reply(200, { success: true });

    logUnhandledRequests(axiosMock);
  });

  describe('Related links', () => {
    beforeEach(() => {
      sendTrackEvent.mockClear();
    });

    it('sends event on click of dates tab link', async () => {
      await fetchAndRender();
      sendTrackEvent.mockClear();

      const datesTabLink = screen.getByRole('link', { name: 'Dates' });
      fireEvent.click(datesTabLink);

      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.related_links.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
        link_clicked: 'dates',
      });
    });

    it('sends event on click of outline tab link', async () => {
      await fetchAndRender();
      sendTrackEvent.mockClear();

      const outlineTabLink = screen.getAllByRole('link', { name: 'Course Outline' });
      fireEvent.click(outlineTabLink[1]); // outlineTabLink[0] corresponds to the link in the DetailedGrades component

      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.related_links.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
        link_clicked: 'course_outline',
      });
    });
  });

  describe('Course Grade', () => {
    it('renders Course Grade', async () => {
      await fetchAndRender();
      expect(screen.getByText('Grades')).toBeInTheDocument();
      expect(screen.getByText('This represents your weighted grade against the grade needed to pass this course.')).toBeInTheDocument();
    });

    it('renders correct copy in CourseGradeFooter for non-passing', async () => {
      setTabData({
        course_grade: {
          is_passing: false,
          letter_grade: null,
          percent: 0.5,
        },
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                learner_has_access: true,
                has_graded_assignment: true,
                num_points_earned: 1,
                num_points_possible: 2,
                percent_graded: 0.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
            ],
          },
        ],
      });
      await fetchAndRender();
      expect(screen.queryByRole('button', { name: 'Grade range tooltip' })).not.toBeInTheDocument();
      expect(screen.getByTestId('currentGradeTooltipContent').innerHTML).toEqual('50%');
      expect(screen.getByTestId('gradeSummaryFooterTotalWeightedGrade').innerHTML).toEqual('50%');
      expect(screen.getByText('A weighted grade of 75% is required to pass in this course')).toBeInTheDocument();
    });

    it('renders correct copy in CourseGradeFooter for passing with pass/fail grade range', async () => {
      await fetchAndRender();
      expect(screen.queryByRole('button', { name: 'Grade range tooltip' })).not.toBeInTheDocument();
      expect(screen.getByText('You’re currently passing this course')).toBeInTheDocument();
    });

    it('renders correct copy and tooltip in CourseGradeFooter for non-passing with letter grade range', async () => {
      setTabData({
        course_grade: {
          is_passing: false,
          letter_grade: null,
          percent: 0,
        },
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            A: 0.9,
            B: 0.8,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByRole('button', { name: 'Grade range tooltip' }));
      expect(screen.getByTestId('currentGradeTooltipContent').innerHTML).toEqual('0%');
      expect(screen.getByTestId('gradeSummaryFooterTotalWeightedGrade').innerHTML).toEqual('0%');
      expect(screen.getByText('A weighted grade of 80% is required to pass in this course')).toBeInTheDocument();
    });

    it('renders correct copy and tooltip in CourseGradeFooter for passing with letter grade range', async () => {
      setTabData({
        course_grade: {
          is_passing: true,
          letter_grade: 'B',
          percent: 0.8,
        },
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                learner_has_access: true,
                has_graded_assignment: true,
                num_points_earned: 8,
                num_points_possible: 10,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
            ],
          },
        ],
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            A: 0.9,
            B: 0.8,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByRole('button', { name: 'Grade range tooltip' }));
      expect(screen.getByTestId('currentGradeTooltipContent').innerHTML).toEqual('80%');
      expect(screen.getByTestId('gradeSummaryFooterTotalWeightedGrade').innerHTML).toEqual('80%');
      expect(await screen.findByText('You’re currently passing this course with a grade of B (80-90%)')).toBeInTheDocument();
    });

    it('renders tooltip in CourseGradeFooter for grade range', async () => {
      setTabData({
        course_grade: {
          percent: 0,
          is_passing: false,
        },
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            A: 0.9,
            B: 0.8,
          },
        },
      });
      await fetchAndRender();
      const tooltip = await screen.getByRole('button', { name: 'Grade range tooltip' });
      fireEvent.click(tooltip);
      expect(screen.getByText('Grade ranges for this course:'));
      expect(screen.getByText('A: 90%-100%'));
      expect(screen.getByText('B: 80%-90%'));
      expect(screen.getByText('F: <80%'));
    });

    it('renders locked feature preview (CourseGradeHeader) with upgrade button when user has locked content', async () => {
      setTabData({
        completion_summary: {
          complete_count: 1,
          incomplete_count: 1,
          locked_count: 1,
        },
        verified_mode: {
          access_expiration_date: '2050-01-01T12:00:00',
          currency: 'USD',
          currency_symbol: '$',
          price: 149,
          sku: 'ABCD1234',
          upgrade_url: 'edx.org/upgrade',
        },
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                learner_has_access: false,
                has_graded_assignment: true,
                num_points_earned: 8,
                num_points_possible: 10,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
            ],
          },
        ],
      });
      await fetchAndRender();
      expect(screen.getByText('locked feature')).toBeInTheDocument();
      expect(screen.getByText('Unlock to view grades and work towards a certificate.')).toBeInTheDocument();
      expect(screen.getAllByRole('link', 'Unlock now')).toHaveLength(3);
    });

    it('sends events on click of upgrade button in locked content header (CourseGradeHeader)', async () => {
      setTabData({
        completion_summary: {
          complete_count: 1,
          incomplete_count: 1,
          locked_count: 1,
        },
        verified_mode: {
          access_expiration_date: '2050-01-01T12:00:00',
          currency: 'USD',
          currency_symbol: '$',
          price: 149,
          sku: 'ABCD1234',
          upgrade_url: 'edx.org/upgrade',
        },
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                learner_has_access: false,
                has_graded_assignment: true,
                num_points_earned: 8,
                num_points_possible: 10,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
            ],
          },
        ],
      });
      await fetchAndRender();
      sendTrackEvent.mockClear();
      expect(screen.getByText('locked feature')).toBeInTheDocument();
      expect(screen.getByText('Unlock to view grades and work towards a certificate.')).toBeInTheDocument();

      const upgradeButton = screen.getAllByRole('link', 'Unlock now')[0];
      fireEvent.click(upgradeButton);

      expect(sendTrackEvent).toHaveBeenCalledTimes(2);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.grades_upgrade.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
      });
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        linkCategory: '(none)',
        linkName: 'progress_locked',
        linkType: 'button',
        pageName: 'progress',
      });
    });

    it('renders locked feature preview with no upgrade button when user has locked content but cannot upgrade', async () => {
      setTabData({
        completion_summary: {
          complete_count: 1,
          incomplete_count: 1,
          locked_count: 1,
        },
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                learner_has_access: false,
                has_graded_assignment: true,
                num_points_earned: 1,
                num_points_possible: 2,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
            ],
          },
        ],
      });
      await fetchAndRender();
      expect(screen.getByText('locked feature')).toBeInTheDocument();
      expect(screen.getByText('The deadline to upgrade in this course has passed.')).toBeInTheDocument();
    });

    it('does not render locked feature preview when user does not have locked content', async () => {
      await fetchAndRender();
      expect(screen.queryByText('locked feature')).not.toBeInTheDocument();
    });

    it('renders limited feature preview with upgrade button when user has access to some content that would typically be locked', async () => {
      setTabData({
        completion_summary: {
          complete_count: 1,
          incomplete_count: 1,
          locked_count: 1,
        },
        verified_mode: {
          access_expiration_date: '2050-01-01T12:00:00',
          currency: 'USD',
          currency_symbol: '$',
          price: 149,
          sku: 'ABCD1234',
          upgrade_url: 'edx.org/upgrade',
        },
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@123456',
                display_name: 'First subsection',
                learner_has_access: false,
                has_graded_assignment: true,
                num_points_earned: 8,
                num_points_possible: 10,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
              {
                assignment_type: 'Exam',
                display_name: 'Second subsection',
                learner_has_access: true,
                has_graded_assignment: true,
                num_points_earned: 1,
                num_points_possible: 1,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/second_subsection',
              },
            ],
          },
        ],
      });
      await fetchAndRender();
      expect(screen.getByText('limited feature')).toBeInTheDocument();
      expect(screen.getByText('Unlock to work towards a certificate.')).toBeInTheDocument();
      expect(screen.queryAllByText('You have limited access to graded assignments as part of the audit track in this course.')).toHaveLength(2);

      expect(screen.queryAllByTestId('blocked-icon')).toHaveLength(4);
    });

    it('does not render subsections for which showGrades is false', async () => {
      // The second assignment has showGrades set to false, so it should not be shown.
      setTabData({
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                learner_has_access: true,
                has_graded_assignment: true,
                num_points_earned: 1,
                num_points_possible: 2,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/first_subsection',
              },
            ],
          },
          {
            display_name: 'Second section',
            subsections: [
              {
                assignment_type: 'Homework',
                display_name: 'Second subsection',
                learner_has_access: true,
                has_graded_assignment: true,
                num_points_earned: 1,
                num_points_possible: 1,
                percent_graded: 1.0,
                show_correctness: 'always',
                show_grades: false,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/second_subsection',
              },
            ],
          },
        ],
      });

      await fetchAndRender();
      expect(screen.getByText('First subsection')).toBeInTheDocument();
      expect(screen.queryByText('Second subsection')).not.toBeInTheDocument();
    });

    it('renders correct title when credit information is available', async () => {
      setTabData({
        credit_course_requirements: {
          eligibility_status: 'eligible',
          requirements: [
            {
              namespace: 'proctored_exam',
              name: 'i4x://edX/DemoX/proctoring-block/final_uuid',
              display_name: 'Proctored Mid Term Exam',
              criteria: {},
              reason: {},
              status: 'satisfied',
              status_date: '2015-06-26 11:07:42',
              order: 1,
            },
          ],
        },
      });

      await fetchAndRender();
      expect(screen.getByText('Grades & Credit')).toBeInTheDocument();
    });
  });

  describe('Grade Summary', () => {
    it('renders Grade Summary table when assignment policies are populated', async () => {
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
    });

    it('does not render Grade Summary when assignment policies are not populated', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [],
          grade_range: {
            pass: 0.75,
          },
        },
        section_scores: [],
      });
      await fetchAndRender();
      expect(screen.queryByText('Grade summary')).not.toBeInTheDocument();
    });

    it('calculates grades correctly when number of droppable assignments equals total number of assignments', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 2,
              num_total: 2,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 100% 0% 0%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of droppable assignments is less than total number of assignments', async () => {
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 100% 100% 100%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of droppable assignments is zero', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 0,
              num_total: 2,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 100% 50% 50%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of total assignments is less than the number of assignments created', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              num_total: 1, // two assignments created in the factory, but 1 is expected per Studio settings
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 100% 100% 100%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of total assignments is greater than the number of assignments created', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 0,
              num_total: 5, // two assignments created in the factory, but 5 are expected per Studio settings
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 100% 20% 20%' })).toBeInTheDocument();
    });
    it('calculates weighted grades correctly', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              num_total: 2,
              short_label: 'HW',
              type: 'Homework',
              weight: 0.5,
            },
            {
              num_droppable: 0,
              num_total: 1,
              short_label: 'Ex',
              type: 'Exam',
              weight: 0.5,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 50% 100% 50%' })).toBeInTheDocument();
      expect(screen.getByRole('row', { name: 'Exam 50% 0% 0%' })).toBeInTheDocument();
    });

    it('renders override notice', async () => {
      setTabData({
        section_scores: [
          {
            display_name: 'First section',
            subsections: [
              {
                assignment_type: 'Homework',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
                display_name: 'First subsection',
                has_graded_assignment: true,
                learner_has_access: true,
                num_points_earned: 1,
                num_points_possible: 2,
                percent_graded: 1.0,
                problem_scores: [{
                  earned: 1,
                  possible: 2,
                }],
                show_correctness: 'always',
                show_grades: true,
              },
            ],
          },
          {
            display_name: 'Second section',
            subsections: [
              {
                assignment_type: 'Exam',
                block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@98765',
                display_name: 'Second subsection',
                learner_has_access: true,
                has_graded_assignment: true,
                num_points_earned: 0,
                num_points_possible: 1,
                override: {
                  system: 'PROCTORING',
                  reason: 'Suspicious activity',
                },
                percent_graded: 1.0,
                problem_scores: [{
                  earned: 0,
                  possible: 1,
                }],
                show_correctness: 'always',
                show_grades: true,
                url: 'http://learning.edx.org/course/course-v1:edX+Test+run/second_subsection',
              },
            ],
          },
        ],
      });

      await fetchAndRender();

      const problemScoreDrawerToggle = screen.getByRole('button', { name: 'Toggle individual problem scores for Second subsection' });
      expect(problemScoreDrawerToggle).toBeInTheDocument();

      // Open the problem score drawer
      fireEvent.click(problemScoreDrawerToggle);

      expect(screen.getByText(messages.sectionGradeOverridden.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('Detailed Grades', () => {
    it('renders Detailed Grades table when section scores are populated', async () => {
      await fetchAndRender();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();

      expect(screen.getByText('First subsection'));
      expect(screen.getByText('Second subsection'));
    });

    it('sends event on click of subsection link', async () => {
      await fetchAndRender();
      sendTrackEvent.mockClear();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();

      const subsectionLink = screen.getByRole('link', { name: 'First subsection' });
      fireEvent.click(subsectionLink);

      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.detailed_grades_assignment.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
        assignment_block_key: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
      });
    });

    it('sends event on click of course outline link', async () => {
      await fetchAndRender();
      sendTrackEvent.mockClear();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();

      const outlineLink = screen.getAllByRole('link', { name: 'Course Outline' })[0];
      fireEvent.click(outlineLink);

      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.detailed_grades.course_outline_link.clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        is_staff: false,
      });
    });

    it('renders individual problem score drawer', async () => {
      sendTrackEvent.mockClear();
      await fetchAndRender();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();

      const problemScoreDrawerToggle = screen.getByRole('button', { name: 'Toggle individual problem scores for First subsection' });
      expect(problemScoreDrawerToggle).toBeInTheDocument();

      // Open the problem score drawer
      fireEvent.click(problemScoreDrawerToggle);
      expect(screen.getByText('Problem Scores:')).toBeInTheDocument();
      expect(screen.getAllByText('0/1')).toHaveLength(3);
    });

    it('render message when section scores are not populated', async () => {
      setTabData({
        section_scores: [],
      });
      await fetchAndRender();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();
      expect(screen.getByText('You currently have no graded problem scores.')).toBeInTheDocument();
    });
  });

  describe('Certificate Status', () => {
    beforeAll(() => {
      global.innerWidth = breakpoints.large.minWidth;
    });

    describe('enrolled user', () => {
      beforeEach(async () => {
        setMetadata({ is_enrolled: true });
        sendTrackEvent.mockClear();
      });

      it('Displays text for nonPassing case when learner does not have a passing grade', async () => {
        await fetchAndRender();
        expect(screen.getByText('In order to qualify for a certificate, you must have a passing grade.')).toBeInTheDocument();
      });

      it('sends event when visiting progress tab when learner is not passing', async () => {
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'not_passing',
          certificate_status_variant: 'not_passing',
        });
      });

      it('Displays text for inProgress case when more content is scheduled and the learner does not have a passing grade', async () => {
        setTabData({
          has_scheduled_content: true,
        });
        await fetchAndRender();
        expect(screen.getByText('It looks like there is more content in this course that will be released in the future. Look out for email updates or check back on your course for when this content will be available.')).toBeInTheDocument();
      });

      it('sends event when visiting progress tab when user has scheduled content', async () => {
        setTabData({
          has_scheduled_content: true,
        });
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'not_passing',
          certificate_status_variant: 'has_scheduled_content',
        });
      });

      it('Displays request certificate link', async () => {
        setTabData({
          certificate_data: { cert_status: 'requesting' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByRole('button', { name: 'Request certificate' })).toBeInTheDocument();
      });

      it('sends events on view of progress tab and on click of request certificate link', async () => {
        setTabData({
          certificate_data: { cert_status: 'requesting' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'requesting',
        });

        const requestCertificateLink = screen.getByRole('button', { name: 'Request certificate' });
        fireEvent.click(requestCertificateLink);

        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.course_progress.certificate_status.clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          certificate_status_variant: 'requesting',
        });
      });

      it('Displays verify identity link', async () => {
        setTabData({
          certificate_data: { cert_status: 'unverified' },
          user_has_passing_grade: true,
          verification_data: { link: 'test' },
        });
        await fetchAndRender();
        expect(screen.getByRole('link', { name: 'Verify ID' })).toBeInTheDocument();
      });

      it('sends events on view of progress tab and on click of ID verification link', async () => {
        setTabData({
          certificate_data: { cert_status: 'unverified' },
          user_has_passing_grade: true,
          verification_data: { link: 'test' },
        });
        await fetchAndRender();
        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'unverified',
        });

        const idVerificationLink = screen.getByRole('link', { name: 'Verify ID' });
        fireEvent.click(idVerificationLink);

        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.course_progress.certificate_status.clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          certificate_status_variant: 'unverified',
        });
      });

      it('Displays verification pending message', async () => {
        setTabData({
          certificate_data: { cert_status: 'unverified' },
          verification_data: { status: 'pending' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByText('Your ID verification is pending and your certificate will be available once approved.')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Verify ID' })).not.toBeInTheDocument();
      });

      it('sends event when visiting progress tab with ID verification pending message', async () => {
        setTabData({
          certificate_data: { cert_status: 'unverified' },
          verification_data: { status: 'pending' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'unverified',
        });
      });

      it('Displays download link', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'downloadable',
            download_url: 'fake.download.url',
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByRole('link', { name: 'Download my certificate' })).toBeInTheDocument();
      });

      it('sends events on view of progress tab and on click of downloadable certificate link', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'downloadable',
            download_url: 'fake.download.url',
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'earned_downloadable',
        });

        const downloadCertificateLink = screen.getByRole('link', { name: 'Download my certificate' });
        fireEvent.click(downloadCertificateLink);

        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.course_progress.certificate_status.clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          certificate_status_variant: 'earned_downloadable',
        });
      });

      it('Displays webview link', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'downloadable',
            cert_web_view_url: '/certificates/cooluuidgoeshere',
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByRole('link', { name: 'View my certificate' })).toBeInTheDocument();
      });

      it('sends events on view of progress tab and on click of view certificate link', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'downloadable',
            cert_web_view_url: '/certificates/cooluuidgoeshere',
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'earned_viewable',
        });

        const viewCertificateLink = screen.getByRole('link', { name: 'View my certificate' });
        fireEvent.click(viewCertificateLink);

        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.course_progress.certificate_status.clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          certificate_status_variant: 'earned_viewable',
        });
      });

      it('Displays certificate is earned but unavailable message', async () => {
        setTabData({
          certificate_data: { cert_status: 'earned_but_not_available' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.queryByText('Certificate status')).toBeInTheDocument();
      });

      it('sends event when visiting the progress tab when cert is earned but unavailable', async () => {
        setTabData({
          certificate_data: { cert_status: 'earned_but_not_available' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'earned_but_not_available',
        });
      });

      it('sends event with correct grade variant for passing with letter grades', async () => {
        setTabData({
          certificate_data: { cert_status: 'earned_but_not_available' },
          grading_policy: {
            assignment_policies: [
              {
                num_droppable: 1,
                num_total: 2,
                short_label: 'HW',
                type: 'Homework',
                weight: 1,
              },
            ],
            grade_range: {
              A: 0.9,
              B: 0.8,
            },
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing_grades',
          certificate_status_variant: 'earned_but_not_available',
        });
      });

      it('Displays upgrade link when available', async () => {
        setTabData({
          certificate_data: { cert_status: 'audit_passing' },
          verified_mode: {
            upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
          },
        });
        await fetchAndRender();
        // Keep these text checks in sync with "audit only" test below, so it doesn't end up checking for text that is
        // never actually there, when/if the text changes.
        expect(screen.getByText('You are in an audit track and do not qualify for a certificate. In order to work towards a certificate, upgrade your course today.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade now' })).toBeInTheDocument();
      });

      it('sends events on view of progress tab and when audit learner clicks upgrade link', async () => {
        setTabData({
          certificate_data: { cert_status: 'audit_passing' },
          verified_mode: {
            upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
          },
        });
        await fetchAndRender();
        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'not_passing',
          certificate_status_variant: 'audit_passing',
        });

        const upgradeLink = screen.getByRole('link', { name: 'Upgrade now' });
        fireEvent.click(upgradeLink);

        expect(sendTrackEvent).toHaveBeenCalledTimes(3);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.course_progress.certificate_status.clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          certificate_status_variant: 'audit_passing',
        });
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
          org_key: 'edX',
          courserun_key: courseId,
          linkCategory: '(none)',
          linkName: 'progress_certificate',
          linkType: 'button',
          pageName: 'progress',
        });
      });

      it('Displays nothing if audit only', async () => {
        setTabData({
          certificate_data: { cert_status: 'audit_passing' },
        });
        await fetchAndRender();
        // Keep these queries in sync with "upgrade link" test above, so we don't end up checking for text that is
        // never actually there, when/if the text changes.
        expect(screen.queryByText('You are in an audit track and do not qualify for a certificate. In order to work towards a certificate, upgrade your course today.')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Upgrade now' })).not.toBeInTheDocument();
      });

      it('sends event when visiting the progress tab even when audit user cannot upgrade (i.e. certificate component does not render)', async () => {
        setTabData({
          certificate_data: { cert_status: 'audit_passing' },
        });
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'not_passing',
          certificate_status_variant: 'audit_passing_missed_upgrade_deadline',
        });
      });

      it('Does not display the certificate component if it does not match any statuses', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'bogus_status',
          },
          user_has_passing_grade: true,
        });
        setMetadata({ is_enrolled: true });
        await fetchAndRender();
        expect(screen.queryByTestId('certificate-status-component')).not.toBeInTheDocument();
      });

      it('sends event when visiting progress tab, although no certificate statuses match', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'bogus_status',
          },
          user_has_passing_grade: true,
        });
        setMetadata({ is_enrolled: true });
        await fetchAndRender();

        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_progress.visited', {
          org_key: 'edX',
          courserun_key: courseId,
          is_staff: false,
          track_variant: 'audit',
          grade_variant: 'passing',
          certificate_status_variant: 'certificate_status_disabled',
        });
      });
    });

    it('Does not display the certificate component if the user is not enrolled', async () => {
      await fetchAndRender();
      expect(screen.queryByTestId('certificate-status-component')).not.toBeInTheDocument();
    });
  });

  describe('Credit Information', () => {
    it('renders credit information when provided', async () => {
      setTabData({
        credit_course_requirements: {
          eligibility_status: 'eligible',
          requirements: [
            {
              namespace: 'proctored_exam',
              name: 'i4x://edX/DemoX/proctoring-block/final_uuid',
              display_name: 'Proctored Mid Term Exam',
              criteria: {},
              reason: {},
              status: null,
              status_date: '2015-06-26 11:07:42',
              order: 1,
            },
            {
              namespace: 'grade',
              name: 'i4x://edX/DemoX/proctoring-block/final_uuid',
              display_name: 'Minimum Passing Grade',
              criteria: { min_grade: 0.8 },
              reason: { final_grade: 0.95 },
              status: 'satisfied',
              status_date: '2015-06-26 11:07:44',
              order: 2,
            },
          ],
        },
      });

      await fetchAndRender();
      expect(screen.getByText('Grades & Credit')).toBeInTheDocument();
      expect(screen.getByText('Requirements for course credit')).toBeInTheDocument();
      expect(screen.getByText('You have met the requirements for credit in this course.', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Proctored Mid Term Exam:')).toBeInTheDocument();
      // 80% comes from the criteria.minGrade being 0.8
      expect(screen.getByText('Minimum grade for credit (80%):')).toBeInTheDocument();
      // Completed because the grade requirement has been satisfied
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('does not render credit information when it is not provided', async () => {
      await fetchAndRender();
      expect(screen.queryByText('Grades & Credit')).not.toBeInTheDocument();
      expect(screen.queryByText('Requirements for course credit.')).not.toBeInTheDocument();
    });
  });

  describe('Access expiration masquerade banner', () => {
    it('renders banner when masquerading as a user', async () => {
      setMetadata({ is_enrolled: true, original_user_is_staff: true });
      setTabData({
        access_expiration: {
          expiration_date: '2020-01-01T12:00:00Z',
          masquerading_expired_course: true,
        },
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.getByTestId('instructor-toolbar')).toBeInTheDocument();
      expect(screen.getByText('This learner no longer has access to this course. Their access expired on', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('1/1/2020')).toBeInTheDocument();
    });
    it('does not render banner when not masquerading', async () => {
      setMetadata({ is_enrolled: true, original_user_is_staff: true });
      setTabData({
        access_expiration: {
          expiration_date: '2020-01-01T12:00:00Z',
          masquerading_expired_course: false,
        },
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.queryByText('This learner no longer has access to this course. Their access expired on', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText('1/1/2020')).not.toBeInTheDocument();
    });
  });

  describe('Course start masquerade banner', () => {
    it('renders banner when masquerading as a user', async () => {
      setMetadata({
        is_enrolled: true,
        original_user_is_staff: true,
        is_staff: false,
        start: '2999-01-01T00:00:00Z',
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.getByTestId('instructor-toolbar')).toBeInTheDocument();
      expect(screen.getByText('This learner does not yet have access to this course. The course starts on', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('1/1/2999')).toBeInTheDocument();
    });
    it('does not render banner when not masquerading', async () => {
      setMetadata({
        is_enrolled: true,
        original_user_is_staff: true,
        is_staff: true,
        start: '2999-01-01T00:00:00Z',
      });
      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
      await act(async () => render(<LoadedTabPage courseId={courseId} activeTabSlug="progress">...</LoadedTabPage>, { store }));
      expect(screen.queryByText('This learner does not yet have access to this course. The course starts on', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText('1/1/2999')).not.toBeInTheDocument();
    });
  });

  describe('Viewing progress page of other students by changing url', () => {
    it('Changing the url changes the header', async () => {
      setMetadata({ is_enrolled: true });
      setTabData({ username: 'otherstudent' });

      await executeThunk(thunks.fetchProgressTab(courseId, 10), store.dispatch);
      await act(async () => render(<ProgressTab />, { store }));

      expect(screen.getByText('Course progress for otherstudent')).toBeInTheDocument();
    });
  });
});
