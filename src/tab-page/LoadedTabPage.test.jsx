import React from 'react';
import { Factory } from 'rosie';
import { camelCaseObject, getLoggingService } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { act, screen } from '@testing-library/react';

import { useAlert } from '@src/generic/user-messages';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import LoadedTabPage from './LoadedTabPage';

const Banner = () => <div role="alert">a masquerade banner</div>;
const PageAlert = () => <div role="alert">a page alert</div>;

// Registers one message per topic, as a tab's alert hooks would, and hands the frame the components for them.
const WithAlerts = (props) => {
  useAlert(true, { code: 'banner', topic: 'instructor-toolbar-alerts' });
  useAlert(true, { code: 'pageAlert', topic: 'outline' });
  return <LoadedTabPage masqueradeBanners={{ banner: Banner }} pageAlerts={{ pageAlert: PageAlert }} {...props} />;
};

describe('Loaded Tab Page', () => {
  // No params provider: the frame needs none.
  function renderWithMetadata(courseHomeMetadata, props = {}, { children = null, Component = LoadedTabPage } = {}) {
    const queryClient = createTestQueryClient();
    seedQueryData(
      queryClient,
      courseHomeMetaQuery(courseHomeMetadata.id).queryKey,
      camelCaseObject(courseHomeMetadata),
    );
    return render(
      <QueryClientProvider client={queryClient}>
        <Component courseId={courseHomeMetadata.id} {...props}>
          {children}
        </Component>
      </QueryClientProvider>,
    );
  }

  it('renders correctly', () => {
    renderWithMetadata(Factory.build('courseHomeMetadata'));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('leaves the document title to the page', () => {
    document.title = 'The page title';
    renderWithMetadata(Factory.build('courseHomeMetadata'));

    expect(document.title).toBe('The page title');
  });

  it('shows the masquerade banners first and the page alerts above the content', async () => {
    renderWithMetadata(
      Factory.build('courseHomeMetadata'),
      {},
      { children: <p>Tab content</p>, Component: WithAlerts },
    );

    const banner = await screen.findByText('a masquerade banner');
    const pageAlert = await screen.findByText('a page alert');
    const main = screen.getByRole('main');
    // Each region sits where the frame always had it: the banners first, then the page alerts, then the content.
    expect(banner.compareDocumentPosition(pageAlert)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(pageAlert.compareDocumentPosition(main)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(main).not.toContainElement(pageAlert);
    expect(main).toHaveTextContent('Tab content');
  });

  it('shows streak celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { streak_length_to_celebrate: 3 } });
    await act(async () => renderWithMetadata(courseHomeMetadata));
    expect(screen.getByRole('dialog')).toHaveTextContent('3 day streak');
  });

  describe('tours', () => {
    const renderTours = jest.fn(({ isStreakCelebrationOpen }) => (
      <div data-testid="tours">{isStreakCelebrationOpen ? 'hidden' : 'shown'}</div>
    ));

    it('renders what the tab passes, first, telling it the streak celebration is closed', () => {
      renderWithMetadata(Factory.build('courseHomeMetadata'), { renderTours });

      expect(screen.getByTestId('tours')).toHaveTextContent('shown');
      expect(screen.getByTestId('tours').compareDocumentPosition(screen.getByRole('main')))
        .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('tells it while the streak celebration is open', async () => {
      const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { streak_length_to_celebrate: 3 } });
      await act(async () => renderWithMetadata(courseHomeMetadata, { renderTours }));

      expect(screen.getByTestId('tours')).toHaveTextContent('hidden');
    });
  });

  it('throws when rendered before the course metadata has loaded', () => {
    // jsdom reports the caught render error on console.error; silence it, not the assertion.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <LoadedTabPage courseId="course-v1:edX+DemoX+Demo_Course" />
      </QueryClientProvider>,
    );

    expect(getLoggingService().logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'LoadedTabPage rendered without course metadata for course-v1:edX+DemoX+Demo_Course',
      }),
      expect.anything(),
    );

    consoleError.mockRestore();
  });

  describe('landmark structure', () => {
    it('does not render a <main> wrapper when the content owns its <main> landmark', () => {
      renderWithMetadata(Factory.build('courseHomeMetadata'), { ownsMainLandmark: true });

      // No <main> is emitted from LoadedTabPage: the courseware Sequence provides it.
      expect(document.querySelector('main')).not.toBeInTheDocument();
    });

    it('otherwise wraps the page children in the <main> landmark', () => {
      renderWithMetadata(
        Factory.build('courseHomeMetadata'),
        {},
        { children: <button type="button">Tab content</button> },
      );

      const mainLandmark = screen.getByRole('main');

      expect(mainLandmark).toContainElement(screen.getByRole('button', { name: /tab content/i }));
    });
  });
});
