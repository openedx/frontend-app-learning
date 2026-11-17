import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import routes from '@src/routes';
import { buildBinaryCourseBlocks } from '@src/shared/data/__factories__/courseBlocks.factory';
import { renderRoutes } from '@src/tests/render';
import { handleNextSectionCelebration } from './course/celebration';
import { buildOutlineFromBlocks } from './data/__factories__/learningSequencesOutline.factory';

interface CourseHandlers {
  nextSequenceHandler: () => void;
  previousSequenceHandler: () => void;
  unitNavigationHandler: () => void;
}

// Each case calls a handler the container passes to the course component, which here is a button for each.
jest.mock('./course', () => function Course({
  nextSequenceHandler, previousSequenceHandler, unitNavigationHandler,
}: CourseHandlers) {
  return (
    <main>
      <button type="button" onClick={unitNavigationHandler}>unit navigation</button>
      <button type="button" onClick={nextSequenceHandler}>next sequence</button>
      <button type="button" onClick={previousSequenceHandler}>previous sequence</button>
    </main>
  );
});
jest.mock('./course/celebration');

const courseId = 'course-v1:edX+DemoX+Demo_Course';
interface Block {
  id: string;
  children: string[];
}

// The factory is JavaScript, and TypeScript reads the trees it fills in as empty.
const {
  courseBlocks, unitBlocks, sequenceTree, unitTree,
} = buildBinaryCourseBlocks(courseId, 'Demonstration Course') as {
  courseBlocks: object;
  unitBlocks: Block[];
  sequenceTree: Block[][];
  unitTree: Block[][][];
};
const lmsBaseUrl = getSiteConfig().lmsBaseUrl;

describe('CoursewareContainer handlers', () => {
  let axiosMock: MockAdapter;

  const mockRequests = (celebrations: { first_section: boolean }) => {
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/courseware/course/*`))
      .reply(200, Factory.build('courseMetadata', { celebrations }));
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/course_home/course_metadata/*`))
      .reply(200, Factory.build('courseHomeMetadata'));
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/learning_sequences/v1/course_outline/*`))
      .reply(200, buildOutlineFromBlocks(courseBlocks));
    sequenceTree.flat().forEach((sequenceBlock) => {
      axiosMock.onGet(`${lmsBaseUrl}/api/courseware/sequence/${sequenceBlock.id}`).reply(200, Factory.build(
        'sequenceMetadata',
        {},
        { courseId, sequenceBlock, unitBlocks: unitBlocks.filter(({ id }) => sequenceBlock.children.includes(id)) },
      ));
    });
  };

  // Renders the unit's page and waits for every request of the load, the outline's among them, to finish.
  const renderUnit = async (sequenceId: string, unitId: string) => {
    const { queryClient } = renderRoutes(routes, `/learning/course/${courseId}/${sequenceId}/${unitId}`);
    await screen.findByRole('main');
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    return userEvent.setup();
  };

  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('.')]));

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    (handleNextSectionCelebration as jest.Mock).mockClear();
  });

  it('checks the unit\'s completion when the unit navigation handler is called', async () => {
    const [sequenceId, unitId] = [sequenceTree[0][0].id, unitTree[0][0][0].id];
    const completionUrl = `${lmsBaseUrl}/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`;
    mockRequests({ first_section: false });
    axiosMock.onPost(completionUrl).reply(200, { complete: true });
    const user = await renderUnit(sequenceId, unitId);

    await user.click(screen.getByRole('button', { name: 'unit navigation' }));

    await waitFor(() => expect(axiosMock.history.post.filter(({ url }) => url === completionUrl)).toHaveLength(1));
    expect(JSON.parse(axiosMock.history.post.find(({ url }) => url === completionUrl)?.data)).toEqual({ usage_key: unitId });
  });

  describe('the next sequence handler', () => {
    const clickNextSequence = async (sequenceId: string, unitId: string) => {
      const user = await renderUnit(sequenceId, unitId);
      await user.click(screen.getByRole('button', { name: 'next sequence' }));
    };

    it('records the section change when the next sequence is in another section and the first section is celebrated', async () => {
      mockRequests({ first_section: true });

      await clickNextSequence(sequenceTree[0][1].id, unitTree[0][1][1].id);

      expect(handleNextSectionCelebration).toHaveBeenCalledWith(sequenceTree[0][1].id, sequenceTree[1][0].id);
    });

    it('records nothing when the next sequence is in the same section', async () => {
      mockRequests({ first_section: true });

      await clickNextSequence(sequenceTree[0][0].id, unitTree[0][0][1].id);

      expect(handleNextSectionCelebration).not.toHaveBeenCalled();
    });

    it('records nothing when the first section is not celebrated', async () => {
      mockRequests({ first_section: false });

      await clickNextSequence(sequenceTree[0][1].id, unitTree[0][1][1].id);

      expect(handleNextSectionCelebration).not.toHaveBeenCalled();
    });

    it('records nothing on the course\'s last sequence', async () => {
      mockRequests({ first_section: true });

      await clickNextSequence(sequenceTree[1][1].id, unitTree[1][1][1].id);

      expect(handleNextSectionCelebration).not.toHaveBeenCalled();
    });
  });

  it('requests nothing when the previous sequence handler is called', async () => {
    mockRequests({ first_section: true });
    const user = await renderUnit(sequenceTree[1][0].id, unitTree[1][0][0].id);
    const requests = () => axiosMock.history.get.length + axiosMock.history.post.length;
    const requestsBefore = requests();

    await user.click(screen.getByRole('button', { name: 'previous sequence' }));

    expect(requests()).toBe(requestsBefore);
    expect(handleNextSectionCelebration).not.toHaveBeenCalled();
  });
});
