import { useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import { Factory } from 'rosie';

import {
  getTestStoreIds, initializeMockApp, initializeTestStore, render, screen, waitFor,
} from '../../../../setupTest';
import MountCourseQueryHooks from '../../../../tests/MountCourseQueryHooks';
import { usePluginOverrides } from '../../../../generic/plugin-overrides';
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
  title: 'unit-title',
  bookmarked: false,
  bookmarkedUpdateState: 'pending',
};

let store;
let sequenceId;

const renderComponent = (props, { children = null, search = '' } = {}) => {
  render(
    <MemoryRouter initialEntries={[{ pathname: `/course/${props.courseId}/${sequenceId}/${props.id}`, search }]}>
      <MountCourseQueryHooks courseId={props.courseId} sequenceId={sequenceId} />
      {children}
      <Unit sequenceId={sequenceId} {...props} />
    </MemoryRouter>,
    { store, wrapWithRouter: false },
  );
};

initializeMockApp();

async function setupStoreState() {
  const unitBlocks = [Factory.build(
    'block',
    { type: 'vertical', ...unit },
    { courseId: courseMetadata.id },
  )];

  store = await initializeTestStore({ courseMetadata, unitBlocks });
  ({ sequenceId } = getTestStoreIds(store));
}

describe('<Unit />', () => {
  beforeEach(async () => {
    await setupStoreState();
  });

  describe('unit title', () => {
    it('has two children', async () => {
      renderComponent(defaultProps);
      const unitTitleWrapper = (await screen.findByTestId('org.openedx.frontend.learning.unit_title.v1')).children[0];

      expect(unitTitleWrapper.children).toHaveLength(3);
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

  describe('getIFrameUrl override', () => {
    const IFrameUrlOverridePlugin = () => {
      const { registerOverrideMethod } = usePluginOverrides();
      useEffect(() => {
        registerOverrideMethod({
          pluginName: 'test-plugin',
          methodName: 'getIFrameUrl',
          method: (iframeUrl) => `${iframeUrl}&overridden=1`,
        });
      }, [registerOverrideMethod]);
      return null;
    };

    it('applies a registered override to the iframe src', async () => {
      renderComponent(defaultProps, { children: <IFrameUrlOverridePlugin /> });

      await waitFor(() => {
        expect(screen.getByTestId('content-iframe-test-id').getAttribute('src')).toMatch(/&overridden=1$/);
      });
    });
  });
});
