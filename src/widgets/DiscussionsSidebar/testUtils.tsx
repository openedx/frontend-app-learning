import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';

import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import { discussionTopicsQuery } from '@src/courseware/data/apiHooks';
import AuxiliarySidebarSlot from '@src/slots/AuxiliarySidebarSlot';
import AuxiliarySidebarTriggerSlot from '@src/slots/AuxiliarySidebarTriggerSlot';
import { mockCourseRequests } from '@src/tests/courseware';
import { createTestQueryClient } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import SidebarState from '@src/tests/SidebarState';

/*
 * A course whose units have discussion topics enabled in context, with the topics already loaded into the query
 * client the render uses, so the widget reads them without fetching. The course metadata is not loaded, so the
 * widget's provider requests nothing either.
 */
export const setupDiscussionTopics = async (options: { enabledInContext?: boolean } = {}) => {
  const fixtures = mockCourseRequests({ discussionsProvider: 'openedx', ...options });
  const queryClient = createTestQueryClient();
  await queryClient.query(discussionTopicsQuery(fixtures.courseId));
  return { ...fixtures, queryClient };
};

interface RenderOptions {
  courseId: string;
  sequenceId: string;
  unitId: string;
  queryClient: QueryClient;
}

// Both auxiliary sidebar slots, as the courseware page renders them, with the provider's current sidebar beside.
export const renderAuxiliarySidebar = ({
  courseId, sequenceId, unitId, queryClient,
}: RenderOptions) => render(
  <QueryClientProvider client={queryClient}>
    <SidebarProvider courseId={courseId} unitId={unitId}>
      <AuxiliarySidebarTriggerSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />
      <AuxiliarySidebarSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />
      <SidebarState />
    </SidebarProvider>
  </QueryClientProvider>,
  { wrapWithRouter: true },
);
