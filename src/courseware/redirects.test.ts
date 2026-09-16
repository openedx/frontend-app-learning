import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { initializeMockApp, waitFor } from '../setupTest';
import { getSequenceForUnitDeprecatedUrl } from './data/api';
import {
  outlineFailureRedirect,
  resumeRedirect,
  sectionToSequenceRedirect,
  sectionUnitToUnitRedirect,
  sequenceToSequenceUnitRedirect,
  sequenceUnitMarkerToSequenceUnitRedirect,
  unitToSequenceUnitRedirect,
} from './redirects';

initializeMockApp();

describe('courseware redirect rules', () => {
  let navigate: jest.Mock;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    navigate = jest.fn();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  describe('isPreview equals true', () => {
    describe('sequenceUnitMarkerToSequenceUnitRedirect', () => {
      it('return when sequence is not loaded', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: false,
          sequence: { id: 'sequence_1', unitIds: ['unit_1'] },
          unitId: 'first',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('return when sequence id is null', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: null, unitIds: ['unit_1'] },
          unitId: 'first',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('calls navigate with first unit id', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          unitId: 'first',
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with last unit id', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          unitId: 'last',
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });

    describe('sequenceToSequenceUnitRedirect', () => {
      it('calls navigate with next unit id', () => {
        sequenceToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          unitId: null,
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('returns when the sequence is not loaded', () => {
        sequenceToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: false,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          unitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequence id is null', () => {
        sequenceToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: false,
          sequence: { unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          unitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unit id is defined', () => {
        sequenceToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          unitId: 'unit_2',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unit ids are undefiend', () => {
        sequenceToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', activeUnitIndex: 0 },
          unitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('unitToSequenceUnitRedirect', () => {
      const { href: apiUrl } = getSequenceForUnitDeprecatedUrl('courseId');

      it('calls navigate with parentId and sequenceId', async () => {
        axiosMock.onGet(apiUrl).reply(200, {
          blocks: [{
            id: 'sequence_1',
            type: 'sequential',
            children: ['unit_1'],
          }],
        });

        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/preview/course/courseId/sequence_1/unit_1';

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(apiUrl);
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when getSequenceForUnitDeprecated errors', async () => {
        axiosMock.onGet(apiUrl).reply(404);

        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/course/courseId';

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(apiUrl);
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when no parent id is returned', async () => {
        axiosMock.onGet(apiUrl).reply(200, {
          blocks: [{
            id: 'sequence_1',
            type: 'sequential',
            children: ['block_1'],
          }],
        });

        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/course/courseId';

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(apiUrl);
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when sequnce is not unit', async () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: false,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/course/courseId';

        await waitFor(() => {
          expect(axiosMock.history.get).toHaveLength(0);
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('returns when the course is not loaded', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: false,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when the sequence has not failed', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is defined', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: { sequenceIds: [] },
          routeUnitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when routeUnitId is defined', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: 'unit_1',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('sectionUnitToUnitRedirect', () => {
      it('calls navigate with unitId', () => {
        sectionUnitToUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: { sequenceIds: [] },
          unitId: 'unit_2',
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/preview/course/courseId/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('returns when the course is not loaded', () => {
        sectionUnitToUnitRedirect({
          isCourseLoaded: false,
          courseId: 'courseId',
          isSequenceFailed: false,
          section: { sequenceIds: [] },
          unitId: 'unit_2',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when the sequence has not failed', () => {
        sectionUnitToUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          section: { sequenceIds: [] },
          unitId: 'unit_2',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is null', () => {
        sectionUnitToUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          section: null,
          unitId: 'unit_2',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unitId is null', () => {
        sectionUnitToUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          section: { sequenceIds: [] },
          unitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('resumeRedirect', () => {
      it('calls navigate with unitId', async () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          unitId: 'unit_1',
        });
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/preview/course/courseId/section_1/unit_1';

        await waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate with firstSequenceId', async () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          first_sequence_id: 'sequence_1',
        });
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/course/courseId/sequence_1';

        await waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('returns after calling getResumeBlock', async () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          course_id: 'courseId',
        });
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: null,
          navigate,
          isPreview: true,
        });

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(`${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`);
        });
        await new Promise((resolve) => { setTimeout(resolve, 0); });
        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when the course is not loaded', () => {
        resumeRedirect({
          isCourseLoaded: false,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when sequenceId is defined', () => {
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: 'sequence_3',
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when getResumeBlock throws error', async () => {
        axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`).reply(404);
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: true,
        });

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(`${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`);
        });
        await new Promise((resolve) => { setTimeout(resolve, 0); });
        expect(navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('outlineFailureRedirect', () => {
    it('navigates to the course home when the outline failed and the learner has access', () => {
      outlineFailureRedirect({
        isOutlineFailed: true,
        hasAccess: true,
        courseId: 'courseId',
        navigate,
        isPreview: false,
      });

      expect(navigate).toHaveBeenCalledWith('/course/courseId/home', { replace: true });
    });

    it('returns when the learner lacks access', () => {
      outlineFailureRedirect({
        isOutlineFailed: true,
        hasAccess: false,
        courseId: 'courseId',
        navigate,
        isPreview: false,
      });

      expect(navigate).not.toHaveBeenCalled();
    });

    it('returns when the outline has not failed', () => {
      outlineFailureRedirect({
        isOutlineFailed: false,
        hasAccess: true,
        courseId: 'courseId',
        navigate,
        isPreview: false,
      });

      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('isPreview equals false', () => {
    describe('sectionToSequenceRedirect', () => {
      it('calls navigate with section based sequence id', () => {
        sectionToSequenceRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: { sequenceIds: ['sequence_1'] },
          unitId: null,
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/sequence_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with course id only', () => {
        sectionToSequenceRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: { sequenceIds: [] },
          unitId: null,
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('returns when the course is not loaded', () => {
        sectionToSequenceRedirect({
          isCourseLoaded: false,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: { sequenceIds: [] },
          unitId: null,
          navigate,
          isPreview: false,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when the sequence has not failed', () => {
        sectionToSequenceRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          section: { sequenceIds: [] },
          unitId: null,
          navigate,
          isPreview: false,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is not defined', () => {
        sectionToSequenceRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: null,
          unitId: null,
          navigate,
          isPreview: false,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when unitId is defined', () => {
        sectionToSequenceRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: null,
          unitId: 'unit_1',
          navigate,
          isPreview: false,
        });

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('resumeRedirect', () => {
      it('calls navigate with unitId', async () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          unitId: 'unit_1',
        });
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/section_1/unit_1';

        await waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate with firstSequenceId', async () => {
        axiosMock.onGet(
          `${getConfig().LMS_BASE_URL}/api/courseware/resume/courseId`,
        ).reply(200, {
          section_id: 'section_1',
          first_sequence_id: 'sequence_1',
        });
        resumeRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          sequenceId: undefined,
          firstSequenceId: 'sequence_1',
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/sequence_1';

        await waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });
    });

    describe('sequenceUnitMarkerToSequenceUnitRedirect', () => {
      it('calls navigate with first unit id', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          unitId: 'first',
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with base url when no unit id', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: [] },
          unitId: 'first',
          navigate,
          isPreview: true,
        });
        const expectedUrl = '/course/courseId/sequence_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });

      it('calls navigate with last unit id', () => {
        sequenceUnitMarkerToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'] },
          unitId: 'last',
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/sequence_1/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });

    describe('sequenceToSequenceUnitRedirect', () => {
      it('calls navigate with next unit id', () => {
        sequenceToSequenceUnitRedirect({
          courseId: 'courseId',
          isSequenceLoaded: true,
          sequence: { id: 'sequence_1', unitIds: ['unit_1', 'unit_2'], activeUnitIndex: 0 },
          unitId: null,
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/sequence_1/unit_1';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });

    describe('unitToSequenceUnitRedirect', () => {
      const { href: apiUrl } = getSequenceForUnitDeprecatedUrl('courseId');

      it('calls navigate with parentId and sequenceId', async () => {
        axiosMock.onGet(apiUrl).reply(200, {
          blocks: [{
            id: 'sequence_1',
            type: 'sequential',
            children: ['unit_1'],
          }],
        });
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/sequence_1/unit_1';

        await waitFor(() => {
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when getSequenceForUnitDeprecated errors', async () => {
        axiosMock.onGet(apiUrl).reply(404);
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId';

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(apiUrl);
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('calls navigate to course page when no parent id is returned', async () => {
        axiosMock.onGet(apiUrl).reply(200, {
          blocks: [{
            id: 'sequence_1',
            type: 'sequential',
            children: ['block_1'],
          }],
        });
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId';

        await waitFor(() => {
          expect(axiosMock.history.get.map((req) => req.url)).toContain(apiUrl);
          expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
        });
      });

      it('returns when the course is not loaded', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: false,
          courseId: 'courseId',
          isSequenceFailed: true,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when the sequence has not failed', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when section is defined', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: { sequenceIds: [] },
          routeUnitId: null,
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });

      it('returns when routeUnitId is defined', () => {
        unitToSequenceUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: false,
          mightBeUnit: true,
          sequenceId: 'unit_1',
          section: null,
          routeUnitId: 'unit_1',
          navigate,
          isPreview: true,
        });

        expect(navigate).not.toHaveBeenCalled();
      });
    });

    describe('sectionUnitToUnitRedirect', () => {
      it('calls navigate with unitId', () => {
        sectionUnitToUnitRedirect({
          isCourseLoaded: true,
          courseId: 'courseId',
          isSequenceFailed: true,
          section: { sequenceIds: [] },
          unitId: 'unit_2',
          navigate,
          isPreview: false,
        });
        const expectedUrl = '/course/courseId/unit_2';

        expect(navigate).toHaveBeenCalledWith(expectedUrl, { replace: true });
      });
    });
  });
});
