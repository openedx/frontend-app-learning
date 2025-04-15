import React from 'react';
import { Factory } from 'rosie';
import { getAllByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { initializeTestStore, render, screen } from '../../../../setupTest';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../generic/tabs/useIndexOfLastVisibleChild');

describe('Sequence Navigation Tabs', () => {
  let mockData;

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
  const activeBlockNumber = 2;

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
    mockData = {
      // Blocks are numbered from 1 in the UI, so we're decreasing this by 1 to have correct block's ID in the array.
      unitId: unitBlocks[activeBlockNumber - 1].id,
      onNavigate: () => {},
      showCompletion: false,
      unitIds: unitBlocks.map(unit => unit.id),
    };
  });

  it('renders unit buttons', () => {
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);
    render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    expect(screen.getAllByRole('tabpanel')).toHaveLength(unitBlocks.length);
  });

  it('renders unit buttons and dropdown button', async () => {
    let container = null;

    useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
    const booyah = render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    // wait for links to appear so we aren't testing an empty div
    await screen.findAllByRole('tabpanel');

    container = booyah.container;

    const dropdownToggle = container.querySelector('.dropdown-toggle');
    await userEvent.click(dropdownToggle);

    const dropdownMenu = container.querySelector('.dropdown');
    const dropdownButtons = getAllByRole(dropdownMenu, 'tabpanel');
    expect(dropdownButtons).toHaveLength(unitBlocks.length);
    expect(screen.getByRole('button', { name: `${activeBlockNumber} of ${unitBlocks.length}` }))
      .toHaveClass('dropdown-toggle');
  });
});
