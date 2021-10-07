import React from 'react';
import { Factory } from 'rosie';
import { act, fireEvent, getAllByRole } from '@testing-library/react';

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
    render(<SequenceNavigationTabs {...mockData} />);

    expect(screen.getAllByRole('button')).toHaveLength(unitBlocks.length);
  });

  it('renders unit buttons and dropdown button', async () => {
    let container = null;
    await act(async () => {
      useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
      const booyah = render(<SequenceNavigationTabs {...mockData} />);
      container = booyah.container;

      const dropdownToggle = container.querySelector('.dropdown-toggle');
      // We need to await this click here, which requires us to await the `act` as well above.
      // https://github.com/testing-library/react-testing-library/issues/535
      // Without doing this, we get a warning about using `act` even though we are.
      await fireEvent.click(dropdownToggle);
    });
    const dropdownMenu = container.querySelector('.dropdown');
    const dropdownButtons = getAllByRole(dropdownMenu, 'button');
    expect(dropdownButtons).toHaveLength(unitBlocks.length + 1);
    expect(screen.getByRole('button', { name: `${activeBlockNumber} of ${unitBlocks.length}` }))
      .toHaveClass('dropdown-toggle');
  });
});
