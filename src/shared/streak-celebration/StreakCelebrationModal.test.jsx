import React from 'react';
import { Factory } from 'rosie';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { initializeTestStore, render, screen } from '../../setupTest';
import StreakModal from './StreakCelebrationModal';

jest.mock('@edx/frontend-platform/analytics');

describe('Loaded Tab Page', () => {
  const mockData = { metadataModel: 'coursewareMeta' };

  beforeAll(async () => {
    mockData.open = true;
    mockData.streakLengthToCelebrate = 3;
  });

  it('shows streak celebration modal', async () => {
    const courseMetadata = Factory.build('courseMetadata', { celebrations: { shouldCelebrateStreak: true } });
    mockData.courseId = courseMetadata.id;
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<StreakModal {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    await screen.findByText('3 day streak');
    await screen.findByText('Keep it up, you’re on a roll!');
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.streak.opened', {
      org_key: courseMetadata.org,
      courserun_key: mockData.courseId,
      is_staff: false,
    });
  });
});
