import { Factory } from 'rosie';
import { getSiteConfig } from '@openedx/frontend-base';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { testIDs } from '../../sequence/Unit/ContentIFrame';

describe('Notes Visibility', () => {
  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.scrollTo = jest.fn();
  });

  const renderUnit = async (visible: boolean) => {
    const courseMetadata = Factory.build('courseMetadata', {
      course_access: { has_access: false },
      notes: { enabled: true, visible },
    });
    const fixtures = mockCourseRequests({ courseMetadata });
    const { courseId, sequenceId, unitId } = fixtures;
    const visibilityUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/edxnotes/visibility/`;
    fixtures.axiosMock.onPut(visibilityUrl).reply(200);
    renderRoutes(routes, unitPath(courseId, sequenceId, unitId));
    const iframe = await screen.findByTestId(testIDs.contentIFrame) as HTMLIFrameElement;
    return { ...fixtures, iframe, visibilityUrl };
  };

  it('hides notes', async () => {
    await renderUnit(false);

    const button = screen.getByRole('switch', { name: 'Show Notes' });
    expect(button).not.toBeChecked();
    expect(button).toHaveClass('text-success');
    expect(button.querySelector('svg')).toHaveClass('fa-pencil-alt');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows notes', async () => {
    await renderUnit(true);

    const button = screen.getByRole('switch', { name: 'Hide Notes' });
    expect(button).toBeChecked();
    expect(button).toHaveClass('text-secondary');
    expect(button.querySelector('svg')).toHaveClass('fa-pencil-alt');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles click', async () => {
    const { axiosMock, iframe, visibilityUrl } = await renderUnit(false);
    const postMessage = jest.spyOn(iframe.contentWindow!, 'postMessage');

    fireEvent.click(screen.getByRole('switch', { name: 'Show Notes' }));

    expect(await screen.findByRole('switch', { name: 'Hide Notes' })).toBeChecked();
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].url).toEqual(visibilityUrl);
    expect(axiosMock.history.put[0].data).toEqual('{"visibility":true}');
    await waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
    expect(postMessage).toHaveBeenCalledWith('tools.toggleNotes', getSiteConfig().lmsBaseUrl);
  });
});
