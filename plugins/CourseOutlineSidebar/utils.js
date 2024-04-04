import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import buildSimpleCourseAndSequenceMetadata from '@src/courseware/data/__factories__/sequenceMetadata.factory';
import { initializeTestStore } from '@src/setupTest';
import { executeThunk } from '@src/utils';
import { getCourseOutlineStructure } from './data/thunks';

// eslint-disable-next-line import/prefer-default-export
export const initOutlineSidebarTestStore = async (options = {}) => {
  const {
    courseBlocks, sequenceBlocks, unitBlocks, courseMetadata,
  } = buildSimpleCourseAndSequenceMetadata(options);
  const store = await initializeTestStore({
    courseBlocks, sequenceBlocks, unitBlocks, courseMetadata,
  });

  if (!options.excludeFetchOutlineSidebar) {
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.reset();
    const outlineSidebarUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/sidebar/${courseMetadata.id}`;
    axiosMock.onGet(outlineSidebarUrl).reply(200, {
      ...courseBlocks,
      ...sequenceBlocks,
      ...unitBlocks,
    });

    await executeThunk(getCourseOutlineStructure(courseMetadata.id), store.dispatch);
  }

  return store;
};
