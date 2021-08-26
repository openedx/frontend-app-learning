import React from 'react';
import { Factory } from 'rosie';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { initializeTestStore, render, screen } from '../../setupTest';
import StreakModal from './StreakCelebrationModal';

jest.mock('@edx/frontend-platform/analytics');

describe('Loaded Tab Page', () => {
  const mockData = { metadataModel: 'coursewareMeta' };

  beforeAll(async () => {
    mockData.isStreakCelebrationOpen = true;
    mockData.streakLengthToCelebrate = 3;
  });

  it('shows streak celebration modal', async () => {
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { streakLengthToCelebrate: 3 } });
    mockData.courseId = courseMetadata.id;
    mockData.verifiedMode = courseMetadata.verifiedMode;
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<StreakModal {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    expect(screen.getByText('3 day streak')).toBeInTheDocument();
    expect(screen.getByText('Keep it up, you’re on a roll!')).toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.streak.opened', {
      org_key: courseMetadata.org,
      courserun_key: mockData.courseId,
      is_staff: false,
    });
  });

  it('shows streak celebration modal AA-759 experiment', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => {
        const matches = !!(query === 'screen and (min-width: 575px)');
        return {
          matches,
          media: query,
          onchange: null,
          addListener: jest.fn(), // deprecated
          removeListener: jest.fn(), // deprecated
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      }),
    });
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { shouldCelebrateStreak: 3 } });
    mockData.courseId = courseMetadata.id;
    mockData.verifiedMode = courseMetadata.verifiedMode;
    mockData.StreakCelebrationCouponEnabled = true;
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<StreakModal {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    expect(screen.getByText('You’ve unlocked a 15% off discount when you upgrade this course for a limited time only.')).toBeInTheDocument();
    expect(screen.getByText('Ends 7/20/2021.')).toBeInTheDocument();
    expect(screen.getByText('Continue with course')).toBeInTheDocument();
  });
});
