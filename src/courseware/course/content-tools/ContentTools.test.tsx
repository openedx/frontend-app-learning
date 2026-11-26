import { Factory } from 'rosie';
import { screen } from '@testing-library/react';

import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { testIDs } from '../sequence/Unit/ContentIFrame';

describe('Content Tools', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.scrollTo = jest.fn();
  });

  const renderUnit = async (courseMetadataOptions = {}) => {
    const courseMetadata = Factory.build('courseMetadata', {
      course_access: { has_access: false },
      ...courseMetadataOptions,
    });
    const { courseId, sequenceId, unitId } = mockCourseRequests({ courseMetadata });
    const { container } = renderRoutes(routes, unitPath(courseId, sequenceId, unitId));
    await screen.findByTestId(testIDs.contentIFrame);
    return container;
  };

  it('renders no tools on a course that enables neither', async () => {
    const container = await renderUnit();

    expect(container.querySelector('.content-tools .d-flex')).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Calculator' })).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('renders the calculator on a course that enables it', async () => {
    await renderUnit({ show_calculator: true });

    expect(screen.getByRole('button', { name: 'Calculator' })).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('renders the notes toggle on a course that enables notes', async () => {
    await renderUnit({ notes: { enabled: true, visible: true } });

    expect(screen.getByRole('switch', { name: 'Hide Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Calculator' })).not.toBeInTheDocument();
  });
});
