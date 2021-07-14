import React from 'react';
import { Factory } from 'rosie';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  loadUnit, render, screen, waitFor, getByRole, initializeTestStore, fireEvent,
} from '../../setupTest';
import Course from './Course';
import { handleNextSectionCelebration } from './celebration';
import * as celebrationUtils from './celebration/utils';
import useWindowSize from '../../generic/tabs/useWindowSize';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('../../generic/tabs/useWindowSize');
useWindowSize.mockReturnValue({ width: 1200 });

const recordFirstSectionCelebration = jest.fn();
celebrationUtils.recordFirstSectionCelebration = recordFirstSectionCelebration;

describe('Course', () => {
  let store;
  const mockData = {
    nextSequenceHandler: () => {},
    previousSequenceHandler: () => {},
    unitNavigationHandler: () => {},
  };

  beforeAll(async () => {
    store = await initializeTestStore();
    const { courseware, models } = store.getState();
    const { courseId, sequenceId } = courseware;
    Object.assign(mockData, {
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    });
  });

  it('loads learning sequence', async () => {
    render(<Course {...mockData} />);
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Learn About Verified Certificates' })).not.toBeInTheDocument();

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

    const { models } = store.getState();
    const sequence = models.sequences[mockData.sequenceId];
    const section = models.sections[sequence.sectionId];
    const course = models.coursewareMeta[mockData.courseId];
    expect(document.title).toMatch(
      `${sequence.title} | ${section.title} | ${course.title} | edX`,
    );
  });

  it('displays celebration modal', async () => {
    // TODO: Remove these console mocks after merging https://github.com/edx/paragon/pull/526.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const courseMetadata = Factory.build('courseMetadata', { celebrations: { firstSection: true } });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[0].id,
    };
    // Set up LocalStorage for testing.
    handleNextSectionCelebration(sequenceId, sequenceId, testData.unitId);
    render(<Course {...testData} />, { store: testStore });

    const celebrationModal = screen.getByRole('dialog');
    expect(celebrationModal).toBeInTheDocument();
    expect(getByRole(celebrationModal, 'heading', { name: 'Congratulations!' })).toBeInTheDocument();
  });

  it('displays upgrade sock', async () => {
    const courseMetadata = Factory.build('courseMetadata', { can_show_upgrade_sock: true });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);

    render(<Course {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    expect(screen.getByRole('button', { name: 'Learn About Verified Certificates' })).toBeInTheDocument();
  });

  it('displays notification trigger and toggles active class on click', async () => {
    useWindowSize.mockReturnValue({ width: 1200 });
    render(<Course {...mockData} />);

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });

    expect(notificationTrigger).toBeInTheDocument();
    expect(notificationTrigger).toHaveClass('active');
    fireEvent.click(notificationTrigger);
    expect(notificationTrigger).not.toHaveClass('active');
  });

  it('displays offer and expiration alert', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      access_expiration: {
        expiration_date: '2080-01-01T12:00:00Z',
        masquerading_expired_course: false,
        upgrade_deadline: null,
        upgrade_url: null,
      },
      offer: {
        code: 'EDXWELCOME',
        expiration_date: '2070-01-01T12:00:00Z',
        original_price: '$100',
        discounted_price: '$85',
        percentage: 15,
        upgrade_url: 'https://example.com/upgrade',
      },
    });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    render(<Course {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    await screen.findByText('EDXWELCOME');
    await screen.findByText('Audit Access Expires');
  });

  it('sends analytics event onClick of access expiration upgrade link', async () => {
    sendTrackEvent.mockClear();

    const courseMetadata = Factory.build('courseMetadata', {
      access_expiration: {
        expiration_date: '2080-01-01T12:00:00Z',
        masquerading_expired_course: false,
        upgrade_deadline: '2070-01-01T12:00:00Z',
        upgrade_url: 'https://example.com/upgrade',
      },
      user_timezone: 'UTC',
    });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    render(<Course {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    await screen.findByText('Audit Access Expires');

    const upgradeLink = screen.getByRole('link', { name: 'Upgrade now' });
    fireEvent.click(upgradeLink);

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: 'edX',
      courserun_key: courseMetadata.id,
      linkCategory: 'FBE_banner',
      linkName: 'in_course_audit_access_expires',
      linkType: 'link',
      pageName: 'in_course',
    });
  });

  it('sends analytics event onClick of offer alert link', async () => {
    sendTrackEvent.mockClear();

    const courseMetadata = Factory.build('courseMetadata', {
      offer: {
        code: 'EDXWELCOME',
        expiration_date: '2070-01-01T12:00:00Z',
        original_price: '$100',
        discounted_price: '$85',
        percentage: 15,
        upgrade_url: 'https://example.com/upgrade',
      },
      user_timezone: 'UTC',
    });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    render(<Course {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    await screen.findByText('EDXWELCOME');

    const upgradeLink = screen.getByRole('link', { name: 'Upgrade now' });
    fireEvent.click(upgradeLink);

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: 'edX',
      courserun_key: courseMetadata.id,
      linkCategory: 'welcome',
      linkName: 'in_course_welcome',
      linkType: 'link',
      pageName: 'in_course',
    });
  });

  it('passes handlers to the sequence', async () => {
    const nextSequenceHandler = jest.fn();
    const previousSequenceHandler = jest.fn();
    const unitNavigationHandler = jest.fn();

    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { courseware, models } = testStore.getState();
    const { courseId, sequenceId } = courseware;
    const testData = {
      ...mockData,
      courseId,
      sequenceId,
      unitId: Object.values(models.units)[1].id, // Corner cases are already covered in `Sequence` tests.
      nextSequenceHandler,
      previousSequenceHandler,
      unitNavigationHandler,
    };
    render(<Course {...testData} />, { store: testStore });

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));
    screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));

    // We are in the middle of the sequence, so no
    expect(previousSequenceHandler).not.toHaveBeenCalled();
    expect(nextSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).toHaveBeenCalledTimes(4);
  });
});
