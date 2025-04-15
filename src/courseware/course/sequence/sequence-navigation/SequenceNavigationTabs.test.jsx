import React from 'react';
import { Factory } from 'rosie';
import { getAllByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { initializeTestStore, render, screen } from '../../../../setupTest';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';
import {
  useIsSidebarOpen,
  useIsOnXLDesktop,
  useIsOnLargeDesktop,
  useIsOnMediumDesktop,
} from './hooks';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../generic/tabs/useIndexOfLastVisibleChild');

jest.mock('./hooks', () => ({
  useIsSidebarOpen: jest.fn(),
  useIsOnXLDesktop: jest.fn(),
  useIsOnLargeDesktop: jest.fn(),
  useIsOnMediumDesktop: jest.fn(),
}));

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

    expect(screen.getAllByRole('tab')).toHaveLength(unitBlocks.length);
  });

  it('renders unit buttons and dropdown button', async () => {
    let container = null;

    useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
    const booyah = render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    // wait for links to appear so we aren't testing an empty div
    await screen.findAllByRole('tab');

    container = booyah.container;

    const dropdownToggle = container.querySelector('.dropdown-toggle');
    await userEvent.click(dropdownToggle);

    const dropdownMenu = container.querySelector('.dropdown');
    const dropdownButtons = getAllByRole(dropdownMenu, 'tab');
    expect(dropdownButtons).toHaveLength(unitBlocks.length);
    expect(screen.getByRole('button', { name: `${activeBlockNumber} of ${unitBlocks.length}` }))
      .toHaveClass('dropdown-toggle');
  });

  it('adds class navigation-tab-width-xl when isOnXLDesktop and sidebar is open', () => {
    useIsSidebarOpen.mockReturnValue(true);
    useIsOnXLDesktop.mockReturnValue(true);
    useIsOnLargeDesktop.mockReturnValue(false);
    useIsOnMediumDesktop.mockReturnValue(false);
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);

    const { container } = render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    const wrapperDiv = container.querySelector('.navigation-tab-width-xl');
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('adds class navigation-tab-width-large when isOnLargeDesktop and sidebar is open', () => {
    useIsSidebarOpen.mockReturnValue(true);
    useIsOnXLDesktop.mockReturnValue(false);
    useIsOnLargeDesktop.mockReturnValue(true);
    useIsOnMediumDesktop.mockReturnValue(false);
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);

    const { container } = render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    const wrapperDiv = container.querySelector('.navigation-tab-width-large');
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('adds class navigation-tab-width-medium when isOnMediumDesktop and sidebar is open', () => {
    useIsSidebarOpen.mockReturnValue(true);
    useIsOnXLDesktop.mockReturnValue(false);
    useIsOnLargeDesktop.mockReturnValue(false);
    useIsOnMediumDesktop.mockReturnValue(true);
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);

    const { container } = render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    const wrapperDiv = container.querySelector('.navigation-tab-width-medium');
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('applies invisibleStyle when shouldDisplayDropdown is true', () => {
    useIsSidebarOpen.mockReturnValue(true);
    useIsOnXLDesktop.mockReturnValue(false);
    useIsOnLargeDesktop.mockReturnValue(false);
    useIsOnMediumDesktop.mockReturnValue(false);

    useIndexOfLastVisibleChild.mockReturnValue([
      0,
      null,
      {
        position: 'absolute',
        left: '0px',
        pointerEvents: 'none',
        visibility: 'hidden',
        maxWidth: '100%',
      },
    ]);

    render(<SequenceNavigationTabs {...mockData} />, { wrapWithRouter: true });

    const tabList = screen.getByRole('tablist');

    expect(tabList.style.position).toBe('absolute');
    expect(tabList.style.left).toBe('0px');
    expect(tabList.style.pointerEvents).toBe('none');
    expect(tabList.style.visibility).toBe('hidden');
    expect(tabList.style.maxWidth).toBe('100%');
  });
});
