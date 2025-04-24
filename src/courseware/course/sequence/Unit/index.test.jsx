import { MemoryRouter } from 'react-router';
import { Factory } from 'rosie';

import {
  initializeMockApp, initializeTestStore, render, screen,
} from '../../../../setupTest';
import { getIFrameUrl } from './urls';
import { views } from './constants';
import Unit from '.';

const defaultProps = {
  courseId: 'test-course-id',
  format: 'test-format',
  onLoaded: jest.fn().mockName('props.onLoaded'),
  id: 'unit-id',
  isOriginalUserStaff: false,
  isEnabledOutlineSidebar: false,
  renderUnitNavigation: jest.fn(enabled => enabled && 'UnitNaviagtion'),
};

const unit = {
  id: 'unit-id',
  title: 'unit-title',
  bookmarked: false,
  bookmarkedUpdateState: 'pending',
};

let store;

const renderComponent = (props) => {
  render(
    <MemoryRouter initialEntries={[{ pathname: `/course/${props.courseID}` }]}>
      <Unit {...props} />
    </MemoryRouter>,
    { store, wrapWithRouter: false },
  );
};

initializeMockApp();

async function setupStoreState() {
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = [Factory.build(
    'block',
    { type: 'vertical', ...unit },
    { courseId: courseMetadata.id },
  )];

  store = await initializeTestStore({ courseMetadata, unitBlocks });
}

describe('<Unit />', () => {
  beforeEach(async () => {
    await setupStoreState();
  });

  describe('unit title', () => {
    it('has two children', () => {
      renderComponent(defaultProps);
      const unitTitleWrapper = screen.getByTestId('org.openedx.frontend.learning.unit_title.v1').children[0];

      expect(unitTitleWrapper.children).toHaveLength(3);
    });

    it('renders bookmark button', () => {
      renderComponent(defaultProps);

      expect(screen.getByText('Bookmark this page')).toBeInTheDocument();
    });

    it('does not render unit navigation buttons', () => {
      renderComponent(defaultProps);

      const nextButton = screen.queryByText('UnitNaviagtion');

      expect(nextButton).toBeNull();
    });

    it('renders unit navigation buttons when isEnabledOutlineSidebar is true', () => {
      const props = { ...defaultProps, isEnabledOutlineSidebar: true };
      renderComponent(props);

      const nextButton = screen.getByText('UnitNaviagtion');

      expect(nextButton).toBeVisible();
    });
  });

  describe('UnitSuspense', () => {
    it('renders loading message', () => {
      renderComponent(defaultProps);

      expect(screen.getByText('Loading', { exact: false })).toBeInTheDocument();
    });
  });

  describe('ContentIFrame', () => {
    let iframe;
    beforeEach(() => {
      renderComponent(defaultProps);
      iframe = screen.getByTestId('content-iframe-test-id');
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
        preview: 0,
      }));
    });
  });
});
