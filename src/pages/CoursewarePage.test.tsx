import { getAuthenticatedHttpClient, getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import type { ReactElement } from 'react';
import { Factory } from 'rosie';

import routes from '@src/routes';
import { coursewareTabSlotId } from '@src/slots/CoursewareTabSlot';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { appendBrowserTimezoneToUrl } from '@src/utils';
import { coursewareTabWidgetId } from '@src/widgets/CoursewareTab';

// Learning's widget loads the courseware lazily: this stands in for it, and shows the props the widget gave it.
jest.mock('@src/courseware', () => function CoursewareContainer(props: object) {
  return <pre data-testid="courseware">{JSON.stringify(props)}</pre>;
});

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';
const outlineUrl = `${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/${courseId}`;

let axiosMock: MockAdapter;

beforeEach(() => {
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.onGet(appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`))
    .reply(200, Factory.build('courseHomeMetadata'));
});

// Renders the route and waits for `ready` to show and the course metadata request to settle.
const renderSettled = async (path: string, ready: () => Promise<HTMLElement>) => {
  const { queryClient } = renderRoutes(routes, path);
  const element = await ready();
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  return element;
};

describe('the courseware page', () => {
  it.each([
    ['the course root', `/learning/course/${courseId}`, {}],
    ['a sequence', `/learning/course/${courseId}/${sequenceId}`, { sequenceId }],
    ['a unit', `/learning/course/${courseId}/${sequenceId}/${unitId}`, { sequenceId, unitId }],
    ['a sequence, previewing', `/learning/preview/course/${courseId}/${sequenceId}`, { sequenceId, isPreview: true }],
    ['a unit, previewing', `/learning/preview/course/${courseId}/${sequenceId}/${unitId}`, { sequenceId, unitId, isPreview: true }],
  ])("renders Learning's courseware widget in its slot at %s", async (_name, path, expected) => {
    // A widget beside Learning's receives the slot's props.
    const Beside = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: coursewareTabSlotId,
      id: 'org.example.widget.beside',
      op: WidgetOperationTypes.INSERT_AFTER,
      relatedId: coursewareTabWidgetId,
      component: Beside,
    }]);

    expect(await renderSettled(path, () => screen.findByTestId('courseware'))).toBeInTheDocument();
    expect(Beside.mock.calls[0][0]).toEqual({ courseId, ...expected });
  });

  it("renders a widget that replaces Learning's instead", async () => {
    const Replacement = jest.fn<ReactElement, [object]>(() => <p>My courseware</p>);
    addSlotOperations([{
      slotId: coursewareTabSlotId,
      id: 'org.example.widget.replacement',
      op: WidgetOperationTypes.REPLACE,
      relatedId: coursewareTabWidgetId,
      component: Replacement,
    }]);

    expect(await renderSettled(`/learning/course/${courseId}/${sequenceId}`, () => screen.findByText('My courseware')))
      .toBeInTheDocument();
    expect(Replacement.mock.calls[0][0]).toEqual({ courseId, sequenceId });
    expect(screen.queryByTestId('courseware')).not.toBeInTheDocument();
  });
});

describe('the courseware page title', () => {
  const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@section';
  const outline = {
    course_key: courseId,
    title: 'Outline Course',
    outline: {
      sections: [{
        id: sectionId, title: 'A Section', sequence_ids: [sequenceId], effective_start: null,
      }],
      sequences: {
        [sequenceId]: {
          id: sequenceId, title: 'A Subsection', accessible: true, effective_start: null,
        },
      },
    },
  };

  // The page asks for the outline itself, whatever its slot holds: here the courseware is a stand-in that asks for
  // nothing. The outline answers when the test says so.
  let respond: (value: [number, object]) => void = () => {};
  beforeEach(() => {
    axiosMock.onGet(outlineUrl).reply(() => new Promise((resolve) => {
      respond = resolve;
    }));
  });

  const renderThenLoadOutline = async (path: string) => {
    const { queryClient } = renderRoutes(routes, path);
    await screen.findByTestId('courseware');
    await waitFor(() => expect(document.title).toBe('Course | Demonstration Course | Learning Test Site'));
    respond([200, outline]);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  };

  it("is the tab's until the outline loads, then the unit's breadcrumbs", async () => {
    await renderThenLoadOutline(`/learning/course/${courseId}/${sequenceId}/${unitId}`);

    await waitFor(() => expect(document.title).toBe('A Subsection | A Section | Outline Course | Learning Test Site'));
  });

  it('names the course alone at the course root', async () => {
    await renderThenLoadOutline(`/learning/course/${courseId}`);

    await waitFor(() => expect(document.title).toBe('Outline Course | Learning Test Site'));
  });

  it('names the course alone at a subsection the outline does not have', async () => {
    await renderThenLoadOutline(`/learning/course/${courseId}/block-v1:edX+DemoX+Demo_Course+type@sequential+block@gone`);

    await waitFor(() => expect(document.title).toBe('Outline Course | Learning Test Site'));
  });

  it("stays the tab's when the outline fails", async () => {
    axiosMock.onGet(outlineUrl).reply(403);
    const { queryClient } = renderRoutes(routes, `/learning/course/${courseId}/${sequenceId}/${unitId}`);
    await screen.findByTestId('courseware');
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    await waitFor(() => expect(document.title).toBe('Course | Demonstration Course | Learning Test Site'));
  });
});
