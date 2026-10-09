import { getConfig, mergeConfig, setConfig } from '@edx/frontend-platform';
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import type { ExamScenario } from '@edx/frontend-lib-special-exams/testing';

import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import Sequence from '@src/courseware/course/sequence/Sequence';
import {
  act, mockCourseRequests, render, screen,
} from '@src/setupTest';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';

jest.unmock('@openedx/frontend-plugin-framework');
jest.mock('@edx/frontend-platform/analytics');

const SLOT_ID = 'org.openedx.frontend.special_exams.submitted_timed_exam_instructions.v1';
const DEFAULT_TITLE = 'You have submitted your timed exam.';

// The plugin a host would configure: it shows the `timeIsOver` it was given.
const PluginHeading = ({ timeIsOver }: { timeIsOver: boolean }) => (
  <h3>{`Plugin heading, timeIsOver: ${timeIsOver}`}</h3>
);

const renderTimedExam = (scenario: ExamScenario) => {
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = [Factory.build('block', { type: 'vertical' }, { courseId: courseMetadata.id })];
  const sequenceBlocks = [Factory.build(
    'block',
    { type: 'sequential', children: unitBlocks.map((block) => block.id) },
    { courseId: courseMetadata.id },
  )];
  const sequenceMetadata = [Factory.build(
    'sequenceMetadata',
    { is_time_limited: true },
    { courseId: courseMetadata.id, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  )];
  const course = mockCourseRequests({
    courseMetadata, unitBlocks, sequenceBlocks, sequenceMetadata,
  });
  course.specialExams.setExam(course.sequenceId, scenario);
  const { courseId, sequenceId, unitId } = course;
  render(
    <MemoryRouter initialEntries={[`/course/${courseId}/${sequenceId}/${unitId}`]}>
      <Routes>
        <Route
          path="/course/:courseId/:sequenceId/*"
          element={(
            <SidebarProvider courseId={courseId} unitId={unitId} widgets={[]}>
              <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceId} />
              <Sequence
                courseId={courseId}
                sequenceId={sequenceId}
                unitId={unitId}
                unitNavigationHandler={() => {}}
                nextSequenceHandler={() => {}}
                previousSequenceHandler={() => {}}
              />
            </SidebarProvider>
          )}
        />
      </Routes>
    </MemoryRouter>,
  );
  return course;
};

describe('SubmittedTimedExamInstructionsSlot', () => {
  let originalConfig: ReturnType<typeof getConfig>;

  const configurePlugin = (keepDefault: boolean) => {
    setConfig({
      ...getConfig(),
      pluginSlots: {
        [SLOT_ID]: {
          keepDefault,
          plugins: [{
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
              id: 'plugin_heading', priority: 1, type: DIRECT_PLUGIN, RenderWidget: PluginHeading,
            },
          }],
        },
      },
    });
  };

  beforeEach(() => {
    originalConfig = getConfig();
    mergeConfig({ EXAMS_BASE_URL: 'http://localhost:18740' });
  });

  afterEach(() => {
    setConfig(originalConfig);
  });

  it('renders the plugin in place of the default once the learner submits', async () => {
    configurePlugin(false);
    const user = userEvent.setup();
    renderTimedExam({ status: 'started' });

    await user.click(await screen.findByRole('button', { name: 'End My Exam' }));
    await user.click(await screen.findByRole('button', { name: 'Yes, submit my timed exam.' }));

    expect(await screen.findByText('Plugin heading, timeIsOver: false')).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_TITLE)).not.toBeInTheDocument();
  });

  it('passes timeIsOver when the time limit submitted the exam', async () => {
    configurePlugin(false);
    jest.useFakeTimers({ now: new Date('2026-10-07T10:00:00Z') });
    renderTimedExam({ status: 'started', remainingSeconds: 2 });

    // The library holds the countdown at 00:00 for a 5 s grace period, then expires the attempt.
    expect(await screen.findByText('Plugin heading, timeIsOver: true', {}, { timeout: 10_000 })).toBeInTheDocument();

    await act(async () => { await jest.runOnlyPendingTimersAsync(); });
    jest.useRealTimers();
  });

  it('renders the plugin beside the default heading when the default is kept', async () => {
    configurePlugin(true);
    renderTimedExam({ status: 'submitted' });

    expect(await screen.findByText('Plugin heading, timeIsOver: false')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_TITLE)).toBeInTheDocument();
  });
});
