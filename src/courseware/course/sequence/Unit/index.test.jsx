import { getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createContext, useContext, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Factory } from 'rosie';

import { CourseParamsProvider } from '@src/generic/course-params';
import SpecialExamsProvider from '@src/generic/special-exams/SpecialExamsProvider';
import routes from '@src/routes';
import { unitContentSlotId } from '@src/slots/UnitContentSlot';
import { unitTitleSlotId } from '@src/slots/UnitTitleSlot';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import CourseQueryGate from '@src/tests/CourseQueryGate';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';
import { render, renderRoutes } from '@src/tests/render';
import { addSlotOperations, addTestApp } from '@src/tests/slots';
import ContentIFrame from './ContentIFrame';
import { getIFrameUrl } from './urls';
import { views } from './constants';
import Unit from '.';

const courseMetadata = Factory.build('courseMetadata');

const defaultProps = {
  courseId: courseMetadata.id,
  format: 'test-format',
  onLoaded: jest.fn().mockName('props.onLoaded'),
  id: 'unit-id',
  isOriginalUserStaff: false,
  renderUnitNavigation: jest.fn(enabled => enabled && 'UnitNaviagtion'),
};

const unit = {
  id: 'unit-id',
  bookmarked: false,
  bookmarkedUpdateState: 'pending',
};

let sequenceId;
let unitTitle;

// Re-renders what `children` returns on a click, with nothing else changed.
const Rerender = ({ children }) => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setCount(count + 1)}>Re-render</button>
      {children(count)}
    </>
  );
};

// The unit in the courseware, once the queries the courseware container mounts have loaded. The exam access hook needs
// the special exams provider, which the sequence mounts above the unit.
const renderComponent = (props, { search = '' } = {}) => {
  render(
    <MemoryRouter initialEntries={[{ pathname: unitPath(props.courseId, sequenceId, props.id), search }]}>
      <CourseParamsProvider courseId={props.courseId} sequenceId={sequenceId} unitId={props.id}>
        <SpecialExamsProvider>
          <MountCourseQueryHooks courseId={props.courseId} sequenceId={sequenceId} />
          <CourseQueryGate courseId={props.courseId} sequenceId={sequenceId} states={{ sequence: 'success' }}>
            <Rerender>{() => <Unit sequenceId={sequenceId} {...props} />}</Rerender>
          </CourseQueryGate>
        </SpecialExamsProvider>
      </CourseParamsProvider>
    </MemoryRouter>,
  );
};

async function setupStoreState() {
  const unitBlocks = [Factory.build(
    'block',
    { type: 'vertical', ...unit },
    { courseId: courseMetadata.id },
  )];

  ({ sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks }));
  unitTitle = unitBlocks[0].display_name;
}

describe('<Unit />', () => {
  beforeEach(async () => {
    await setupStoreState();
  });

  describe('unit title', () => {
    it('renders the title as a heading', async () => {
      renderComponent(defaultProps);

      expect(await screen.findByRole('heading', { name: unitTitle })).toBeInTheDocument();
    });

    it('passes the unit title slot what it is about', async () => {
      const Widget = jest.fn(() => null);
      addSlotOperations([{
        slotId: unitTitleSlotId,
        id: 'org.example.widget',
        op: WidgetOperationTypes.REPLACE,
        relatedId: 'defaultContent',
        component: Widget,
      }]);
      renderComponent(defaultProps);
      await screen.findByTestId('content-iframe-test-id');

      expect(Widget.mock.calls[0][0]).toEqual({
        courseId: defaultProps.courseId,
        sequenceId,
        unitId: defaultProps.id,
        unit: expect.objectContaining({ id: unit.id, title: unitTitle }),
        renderUnitNavigation: defaultProps.renderUnitNavigation,
      });
    });

    it('renders bookmark button', async () => {
      renderComponent(defaultProps);

      expect(await screen.findByText('Bookmark this page')).toBeInTheDocument();
    });

    it('renders unit navigation buttons', async () => {
      const props = { ...defaultProps };
      renderComponent(props);

      const nextButton = await screen.findByText('UnitNaviagtion');

      expect(nextButton).toBeVisible();
    });
  });

  describe('UnitSuspense', () => {
    it('renders loading message', async () => {
      renderComponent(defaultProps);

      expect(await screen.findByText('Loading', { exact: false })).toBeInTheDocument();
    });
  });

  describe('ContentIFrame', () => {
    let iframe;
    beforeEach(async () => {
      renderComponent(defaultProps);
      iframe = await screen.findByTestId('content-iframe-test-id');
    });

    it('renders content iframe', () => {
      expect(iframe).toBeVisible();
    });

    it('generates correct iframeUrl', () => {
      expect(iframe.getAttribute('src')).toEqual(getIFrameUrl({
        id: defaultProps.id,
        view: views.student,
        format: defaultProps.format,
        examAccess: {
          accessToken: '',
          blockAccess: false,
        },
        jumpToId: null,
        preview: false,
      }));
    });
  });

  describe('iframe url parameters', () => {
    it('omits format from the iframe url when the unit has none', async () => {
      renderComponent({ ...defaultProps, format: undefined });
      expect((await screen.findByTestId('content-iframe-test-id')).getAttribute('src')).not.toContain('format=');
    });

    it('passes jumpToId from the search params into the iframe url', async () => {
      renderComponent(defaultProps, { search: '?jumpToId=some-block-id' });
      expect((await screen.findByTestId('content-iframe-test-id')).getAttribute('src')).toContain('jumpToId=some-block-id');
    });
  });

  describe('unit content slot', () => {
    it('passes the unit content slot every prop of its contract', async () => {
      const Widget = jest.fn(() => null);
      addSlotOperations([{
        slotId: unitContentSlotId,
        id: 'org.example.widget',
        op: WidgetOperationTypes.REPLACE,
        relatedId: 'defaultContent',
        component: Widget,
      }]);
      renderComponent(defaultProps);
      await screen.findByRole('heading', { name: unitTitle });

      expect(screen.queryByTestId('content-iframe-test-id')).not.toBeInTheDocument();
      const iframeUrlParams = {
        id: defaultProps.id,
        view: views.student,
        format: defaultProps.format,
        examAccess: { blockAccess: false, accessToken: '' },
        jumpToId: undefined,
        preview: false,
      };
      expect(Widget.mock.calls[0][0]).toEqual({
        courseId: defaultProps.courseId,
        sequenceId,
        unitId: defaultProps.id,
        title: unitTitle,
        elementId: 'unit-iframe',
        iframeUrl: getIFrameUrl(iframeUrlParams),
        iframeUrlParams,
        loadingMessage: 'Loading learning sequence...',
        shouldShowContent: true,
        onLoaded: defaultProps.onLoaded,
      });
    });

    it('keeps the slot props stable across a re-render with unchanged exam access', async () => {
      const user = userEvent.setup();
      const Widget = jest.fn(() => null);
      addSlotOperations([{
        slotId: unitContentSlotId,
        id: 'org.example.widget',
        op: WidgetOperationTypes.REPLACE,
        relatedId: 'defaultContent',
        component: Widget,
      }]);
      renderComponent(defaultProps);
      await screen.findByRole('heading', { name: unitTitle });
      const callsBefore = Widget.mock.calls.length;
      const [firstProps] = Widget.mock.calls[0];

      await user.click(screen.getByRole('button', { name: 'Re-render' }));

      // The slot is memoized: a prop that changed identity would render the widget again, with new objects.
      expect(Widget).toHaveBeenCalledTimes(callsBefore);
      Widget.mock.calls.forEach(([props]) => {
        expect(props.iframeUrlParams).toBe(firstProps.iframeUrlParams);
        expect(props.iframeUrlParams.examAccess).toBe(firstProps.iframeUrlParams.examAccess);
        expect(props.shouldShowContent).toBe(firstProps.shouldShowContent);
      });
    });
  });
});

// The recipe the slot's README documents: a plugin app whose provider holds a language, a widget in the unit title
// slot that sets it, and a replacement for the slot's default content that adds it to the iframe URL.
describe('a plugin that changes the unit iframe URL', () => {
  const courseId = courseMetadata.id;
  const unitBlocks = Array.from({ length: 2 }).map(() => Factory.build('block', { type: 'vertical' }, { courseId }));

  const LanguageContext = createContext({ language: null, setLanguage: () => {} });
  const makeLanguageProvider = (initialLanguage) => ({ children }) => {
    const [language, setLanguage] = useState(initialLanguage);
    return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
  };
  const LanguageSelector = () => {
    const { setLanguage } = useContext(LanguageContext);
    return <button type="button" onClick={() => setLanguage('es')}>Spanish</button>;
  };
  const TranslatedContent = (props) => {
    const { language } = useContext(LanguageContext);
    if (!language) {
      return <ContentIFrame {...props} id={props.unitId} />;
    }
    const url = new URL(props.iframeUrl);
    url.searchParams.set('dest_lang', language);
    return <ContentIFrame {...props} id={props.unitId} iframeUrl={url.toString()} />;
  };

  const addPlugin = (initialLanguage) => addTestApp({
    providers: [makeLanguageProvider(initialLanguage)],
    slots: [
      {
        slotId: unitTitleSlotId,
        id: 'org.example.widget.languageSelector',
        op: WidgetOperationTypes.APPEND,
        component: LanguageSelector,
      },
      {
        slotId: unitContentSlotId,
        id: 'org.example.widget.translatedContent',
        op: WidgetOperationTypes.REPLACE,
        relatedId: 'defaultContent',
        component: TranslatedContent,
      },
    ],
  });

  const iframeSrc = async () => (await screen.findByTestId('content-iframe-test-id')).getAttribute('src');

  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.scrollTo = jest.fn();
  });

  it('applies the language on the first render of every unit', async () => {
    const user = userEvent.setup();
    const { sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    addPlugin('es');
    const { router } = renderRoutes(routes, unitPath(courseId, sequenceId, unitBlocks[0].id));

    // The first iframe the unit renders already carries the language.
    expect(new URL(await iframeSrc()).searchParams.get('dest_lang')).toEqual('es');
    expect(await iframeSrc()).toContain(unitBlocks[0].id);

    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(router.state.location.pathname).toEqual(unitPath(courseId, sequenceId, unitBlocks[1].id)));
    await waitFor(async () => expect(await iframeSrc()).toContain(unitBlocks[1].id));
    expect(new URL(await iframeSrc()).searchParams.get('dest_lang')).toEqual('es');
  });

  it('renders the default URL until the learner picks a language, then the changed one', async () => {
    const user = userEvent.setup();
    const { sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    addPlugin(null);
    renderRoutes(routes, unitPath(courseId, sequenceId, unitBlocks[0].id));

    const defaultSrc = await iframeSrc();
    expect(defaultSrc).not.toContain('dest_lang');

    await user.click(await screen.findByRole('button', { name: 'Spanish' }));

    const url = new URL(defaultSrc);
    url.searchParams.set('dest_lang', 'es');
    await waitFor(async () => expect(await iframeSrc()).toEqual(url.toString()));
  });
});

// Staff pick who they view the course as in the shell's masquerade bar, which then invalidates every query. The LMS
// renders the unit for whoever that is, at the same address as before.
describe('a change of masquerade', () => {
  const courseId = courseMetadata.id;
  const masqueradeUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/masquerade`;
  const masquerade = (active = {}) => ({
    success: true,
    active: {
      course_key: courseId, role: 'staff', user_name: null, group_id: null, user_partition_id: null, ...active,
    },
    available: [],
  });
  const staff = { is_staff: true, original_user_is_staff: true };

  let axiosMock;
  let queryClient;
  const masqueradeRequests = () => axiosMock.history.get.filter(({ url }) => url === masqueradeUrl);
  const findIFrame = () => screen.findByTestId('content-iframe-test-id');

  // Renders the unit, and waits until it shows and every request has settled.
  const renderUnit = async (courseHomeAttributes, masqueradeAnswer) => {
    const fixtures = mockCourseRequests({
      courseMetadata,
      courseHomeMetadata: Factory.build('courseHomeMetadata', courseHomeAttributes),
    });
    ({ axiosMock } = fixtures);
    axiosMock.onGet(masqueradeUrl).reply(200, masqueradeAnswer);
    ({ queryClient } = renderRoutes(routes, unitPath(courseId, fixtures.sequenceId, fixtures.unitId)));
    const iframe = await findIFrame();
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    return iframe;
  };

  // What the shell's masquerade bar does once the LMS has taken the change.
  const changeMasquerade = async (masqueradeAnswer) => {
    axiosMock.onGet(masqueradeUrl).reply(200, masqueradeAnswer);
    await act(() => queryClient.invalidateQueries());
  };

  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.scrollTo = jest.fn();
  });

  it('loads the unit again each time staff change who they view the course as', async () => {
    const first = await renderUnit(staff, masquerade());

    // The first answer is what the unit loaded under.
    expect(masqueradeRequests()).toHaveLength(1);
    expect(await findIFrame()).toBe(first);

    await changeMasquerade(masquerade({ role: 'student', group_id: 1, user_partition_id: 50 }));
    await waitFor(async () => expect(await findIFrame()).not.toBe(first));
    const second = await findIFrame();
    expect(second.getAttribute('src')).toEqual(first.getAttribute('src'));

    await changeMasquerade(masquerade({ role: 'student', user_name: 'a-learner' }));
    await waitFor(async () => expect(await findIFrame()).not.toBe(second));
    const third = await findIFrame();

    // Back to what the unit first loaded under.
    await changeMasquerade(masquerade());
    await waitFor(async () => expect(await findIFrame()).not.toBe(third));
  });

  it('leaves the unit as it is when everything is refetched and the masquerade is the same', async () => {
    const first = await renderUnit(staff, masquerade());

    await changeMasquerade(masquerade());

    expect(masqueradeRequests()).toHaveLength(2);
    expect(await findIFrame()).toBe(first);
  });

  it('leaves the unit as it is for staff the LMS does not let masquerade', async () => {
    const first = await renderUnit(staff, { success: false });

    await changeMasquerade({ success: false });

    expect(await findIFrame()).toBe(first);
  });

  it('asks nothing for a learner', async () => {
    await renderUnit({}, masquerade());

    expect(masqueradeRequests()).toHaveLength(0);
  });
});
