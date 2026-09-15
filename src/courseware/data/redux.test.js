import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import * as thunks from './thunks';

import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';

import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { initializeMockApp, seedSequenceModels } from '../../setupTest';
import { getCourseMetadata } from './api';
import { addModel } from '../../generic/model-store';
import initializeStore from '../../store';

const { loggingService } = initializeMockApp();

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('Data layer integration tests', () => {
  const courseBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course`;
  const sequenceBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence`;

  // building minimum set of api responses to test all thunks
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { unitBlocks, sequenceBlocks } = buildSimpleCourseBlocks(courseId);
  const sequenceMetadata = Factory.build(
    'sequenceMetadata',
    {},
    { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  );

  const sequenceUrl = `${sequenceBaseUrl}/${sequenceMetadata.item_id}`;
  const sequenceId = sequenceBlocks[0].id;

  let store;

  beforeEach(() => {
    axiosMock.reset();
    loggingService.logError.mockReset();

    store = initializeStore();
  });

  describe('Test fetchCourse', () => {
    const sidebarTogglesUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-navigation-sidebar/toggles/`;

    it('Should store the sidebar toggles on success', async () => {
      axiosMock.onGet(sidebarTogglesUrl).reply(200, { enable_completion_tracking: true });

      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      expect(store.getState().courseware.coursewareOutlineSidebarSettings).toEqual({
        enableCompletionTracking: true,
      });
    });

    it('Should log an error and leave the toggles unset on failure', async () => {
      axiosMock.onGet(sidebarTogglesUrl).networkError();

      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseware.coursewareOutlineSidebarSettings).toEqual({});
    });
  });

  describe('Thunks that require fetched sequences', () => {
    beforeEach(async () => {
      // thunks tested in this block rely on fact, that store already has
      // some info about sequence
      axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
      await seedSequenceModels(store, [sequenceMetadata.item_id]);
    });

    describe('Test saveSequencePosition', () => {
      const gotoPositionURL = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/goto_position`;

      it('Should change and revert sequence model activeUnitIndex in case of error', async () => {
        axiosMock.onPost(gotoPositionURL).networkError();

        const oldPosition = store.getState().models.sequences[sequenceId].activeUnitIndex;
        const newPosition = 123;

        await executeThunk(
          thunks.saveSequencePosition(courseId, sequenceId, newPosition),
          store.dispatch,
          store.getState,
        );

        expect(loggingService.logError).toHaveBeenCalled();
        expect(axiosMock.history.post[0].url).toEqual(gotoPositionURL);
        expect(store.getState().models.sequences[sequenceId].activeUnitIndex).toEqual(oldPosition);
      });

      it('Should update sequence model activeUnitIndex', async () => {
        axiosMock.onPost(gotoPositionURL).reply(201, {});

        const newPosition = 123;

        await executeThunk(
          thunks.saveSequencePosition(courseId, sequenceId, newPosition),
          store.dispatch,
          store.getState,
        );

        expect(axiosMock.history.post[0].url).toEqual(gotoPositionURL);
        expect(store.getState().models.sequences[sequenceId].activeUnitIndex).toEqual(newPosition);
      });
    });
  });

  describe('test saveIntegritySignature', () => {
    it('Should update userNeedsIntegritySignature upon success', async () => {
      const courseMetadataNeedSignature = Factory.build('courseMetadata', {
        user_needs_integrity_signature: true,
      });

      let courseUrlNeedSignature = `${courseBaseUrl}/${courseMetadataNeedSignature.id}`;
      courseUrlNeedSignature = appendBrowserTimezoneToUrl(courseUrlNeedSignature);

      axiosMock.onGet(courseUrlNeedSignature).reply(200, courseMetadataNeedSignature);

      store.dispatch(addModel({
        modelType: 'coursewareMeta',
        model: await getCourseMetadata(courseMetadataNeedSignature.id),
      }));
      expect(
        store.getState().models.coursewareMeta[courseMetadataNeedSignature.id].userNeedsIntegritySignature,
      ).toEqual(true);

      const integritySignatureUrl = `${getConfig().LMS_BASE_URL}/api/agreements/v1/integrity_signature/${courseMetadataNeedSignature.id}`;
      axiosMock.onPost(integritySignatureUrl).reply(200, {});
      await executeThunk(
        thunks.saveIntegritySignature(courseMetadataNeedSignature.id),
        store.dispatch,
        store.getState,
      );
      expect(
        store.getState().models.coursewareMeta[courseMetadataNeedSignature.id].userNeedsIntegritySignature,
      ).toEqual(false);
    });
  });
});
