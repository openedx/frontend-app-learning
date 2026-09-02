import React from 'react';
import { act } from '@testing-library/react';
import { initializeTestStore, render, screen } from '../../../setupTest';
import SequenceContent from './SequenceContent';

describe('Sequence Content', () => {
  let mockData;
  let store;

  beforeAll(async () => {
    store = await initializeTestStore();
    const { models, courseware } = store.getState();
    mockData = {
      gated: false,
      courseId: courseware.courseId,
      sequenceId: courseware.sequenceId,
      unitId: models.sequences[courseware.sequenceId].unitIds[0],
      unitLoadedHandler: () => { },
      renderUnitNavigation: () => { },
    };
  });

  it('displays loading message', () => {
    render(<SequenceContent {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
  });

  it('displays messages for the locked content', async () => {
    const { gatedContent } = store.getState().models.sequences[mockData.sequenceId];
    const { container } = render(<SequenceContent {...mockData} gated />, { wrapWithRouter: true });

    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveClass('fa-lock');
    expect(screen.getByText(
      `You must complete the prerequisite: '${gatedContent.prereqSectionName}' to access this content.`,
    )).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
  });

  it('displays message for no content', () => {
    render(<SequenceContent {...mockData} unitId="" />, { wrapWithRouter: true });
    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
  });

  it('moves focus to div.app-container after unit navigation', async () => {
    // JSDOM does not include the app shell markup, so we create the element manually
    // to match the real DOM structure the focus logic targets.
    const appContainer = global.document.createElement('div');
    appContainer.className = 'app-container';
    global.document.body.appendChild(appContainer);

    const secondUnitId = store.getState().models.sequences[mockData.sequenceId].unitIds[1];
    render(<SequenceContent {...mockData} />, { store, wrapWithRouter: true });

    // Simulate navigating to the next unit by re-rendering with a new unitId.
    // A second render call is used instead of rerender because rerender bypasses
    // the store and provider wrappers from setupTest's custom render helper.
    // We use act to flush the useEffect triggered by the unitId change.
    await act(async () => {
      render(<SequenceContent {...mockData} unitId={secondUnitId} />, { store, wrapWithRouter: true });
    });

    expect(appContainer).toHaveAttribute('tabindex', '-1');
    expect(appContainer).toHaveFocus();

    global.document.body.removeChild(appContainer);
  });

  it('falls back to focusing document.body when div.app-container is absent', async () => {
    // Verify div.app-container is not in the DOM for this test — if a previous
    // test left one behind, this assertion would give a false negative.
    expect(global.document.querySelector('div.app-container')).toBeNull();

    const secondUnitId = store.getState().models.sequences[mockData.sequenceId].unitIds[1];
    render(<SequenceContent {...mockData} />, { store, wrapWithRouter: true });

    // A second render call is used instead of rerender — see comment above.
    await act(async () => {
      render(<SequenceContent {...mockData} unitId={secondUnitId} />, { store, wrapWithRouter: true });
    });

    expect(global.document.body).toHaveFocus();
  });
});
