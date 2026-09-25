import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import {
  fireEvent, getTestStoreIds, initializeTestStore, render, screen,
} from '../../../../setupTest';
import MountCourseQueryHooks from '../../../../tests/MountCourseQueryHooks';
import UnitButton from './UnitButton';

describe('Unit Button', () => {
  let mockData;
  let courseId;
  let sequenceId;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = [Factory.build(
    'block',
    { type: 'problem' },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'video', complete: true },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'other', complete: true, bookmarked: true },
    { courseId: courseMetadata.id },
  )];
  const [unit, completedUnit, bookmarkedUnit] = unitBlocks;

  beforeAll(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    ({ courseId, sequenceId } = getTestStoreIds(store));
    mockData = {
      unitId: unit.id,
      onClick: () => {},
    };
  });

  // Renders the button at its unit route, as SequenceNavigation does: it reads the course and
  // sequence from the route params, and the unit from the sequence the container fetched.
  const renderButton = (props = {}, { preview = false } = {}) => {
    const unitPath = `/course/${courseId}/${sequenceId}/${props.unitId ?? mockData.unitId}`;
    return render(
      <MemoryRouter initialEntries={[preview ? `/preview${unitPath}` : unitPath]}>
        <Routes>
          <Route
            path={`${preview ? '/preview' : ''}/course/:courseId/:sequenceId/:unitId`}
            element={(
              <>
                <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceId} />
                <UnitButton {...mockData} {...props} />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('hides title by default', async () => {
    renderButton();
    expect(await screen.findByTitle(unit.display_name)).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', async () => {
    renderButton({ showTitle: true });
    expect(await screen.findByTitle(unit.display_name)).toHaveTextContent(unit.display_name);
  });

  it('does not show completion for non-completed unit', async () => {
    const { container } = renderButton();
    await screen.findByTitle(unit.display_name);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('shows completion for completed unit', async () => {
    const { container } = renderButton({ unitId: completedUnit.id });
    await screen.findByTitle(completedUnit.display_name);
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(2);
    expect(buttonIcons[1]).toHaveClass('fa-check');
  });

  it('hides completion', async () => {
    const { container } = renderButton({ unitId: completedUnit.id, showCompletion: false });
    await screen.findByTitle(completedUnit.display_name);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('does not show bookmark', async () => {
    renderButton();
    await screen.findByTitle(unit.display_name);
    expect(screen.queryByTestId('bookmark-icon')).toBeNull();
  });

  it('shows bookmark', async () => {
    const { container } = renderButton({ unitId: bookmarkedUnit.id });
    await screen.findByTitle(bookmarkedUnit.display_name);
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(3);

    const bookmarkIcon = buttonIcons[2].closest('span');
    expect(bookmarkIcon.getAttribute('data-testid')).toBe('bookmark-icon');
  });

  it('handles the click', async () => {
    const onClick = jest.fn();
    renderButton({ onClick });
    fireEvent.click(await screen.findByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('falls back to the passed title and contentType when the unit is not in the sequence', async () => {
    const { container } = renderButton({ unitId: 'block-without-an-entry', title: '', contentType: 'lock' });
    await screen.findByRole('link');
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(1);
    expect(buttonIcons[0]).toHaveClass('fa-lock');
    expect(screen.queryByTestId('bookmark-icon')).toBeNull();
  });

  it('prefixes the unit link with /preview on a preview route', async () => {
    const unitPath = `/course/${courseId}/${sequenceId}/${unit.id}`;
    renderButton({}, { preview: true });
    expect(await screen.findByRole('link')).toHaveAttribute('href', `/preview${unitPath}`);
  });
});
