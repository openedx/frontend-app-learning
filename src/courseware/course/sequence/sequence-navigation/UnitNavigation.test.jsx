import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import userEvent from '@testing-library/user-event';
import {
  render, screen, initializeTestStore, waitFor,
} from '../../../../setupTest';
import UnitNavigation from './UnitNavigation';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Unit Navigation', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  ));

  beforeEach(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    const { courseware } = store.getState();
    mockData = {
      courseId: courseware.courseId,
      unitId: unitBlocks[1].id,
      sequenceId: courseware.sequenceId,
      onClickPrevious: () => {},
      onClickNext: () => {},
    };
  });

  const renderNav = (props = {}, { store } = {}) => {
    const sequenceId = props.sequenceId ?? mockData.sequenceId;
    return render(
      <MemoryRouter initialEntries={[`/course/${courseMetadata.id}/${sequenceId || 'no-sequence'}`]}>
        <Routes>
          <Route
            path="/course/:courseId/:sequenceId/*"
            element={<UnitNavigation {...mockData} {...props} />}
          />
        </Routes>
      </MemoryRouter>,
      { store },
    );
  };

  it('renders correctly without units', () => {
    renderNav({
      sequenceId: '',
      unitId: '',
      onClickPrevious: () => {},
      onClickNext: () => {},
    });

    // Only "Previous" and "Next" buttons should be rendered.
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('handles the clicks', async () => {
    const user = userEvent.setup();
    const onClickPrevious = jest.fn();
    const onClickNext = jest.fn();

    renderNav({ onClickPrevious, onClickNext });

    await waitFor(() => expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href'));
    await user.click(screen.getByRole('link', { name: /previous/i }));
    expect(onClickPrevious).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('link', { name: /next/i }));
    expect(onClickNext).toHaveBeenCalledTimes(1);
  });

  it('when clicked it calls navigate when is at the top', async () => {
    const user = userEvent.setup();
    const onClickPrevious = jest.fn();
    const onClickNext = jest.fn();

    renderNav({ onClickPrevious, onClickNext, isAtTop: true });

    await waitFor(() => expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(onClickPrevious).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onClickNext).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('has the navigation buttons enabled for the non-corner unit in the sequence', async () => {
    renderNav();

    await waitFor(() => expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href'));
    screen.getAllByRole('link').forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('has the "Previous" button disabled for the first unit in the sequence', async () => {
    renderNav({ unitId: unitBlocks[0].id });

    expect(await screen.findByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('link', { name: /next/i })).toBeEnabled();
  });

  it('has the "Next" button disabled for the last unit in the sequence if there is no Exit Page', async () => {
    const testCourseMetadata = { ...courseMetadata, certificate_data: { cert_status: 'bogus_status' }, user_has_passing_grade: true };
    const testStore = await initializeTestStore({ courseMetadata: testCourseMetadata, unitBlocks }, false);
    // Have to refetch the sequenceId since the new store generates new sequences
    const { courseware } = testStore.getState();
    const testData = { ...mockData, sequenceId: courseware.sequenceId };

    renderNav({ ...testData, unitId: unitBlocks[unitBlocks.length - 1].id }, { store: testStore });

    expect(await screen.findByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('link', { name: /previous/i })).toBeEnabled();
  });

  it('has the "Next" button disabled for entrance exam failed', async () => {
    const testCourseMetadata = {
      ...courseMetadata,
      certificate_data: { cert_status: 'bogus_status' },
      enrollment: { is_active: true },
      entrance_exam_data: {
        entrance_exam_current_score: 0, entrance_exam_enabled: true, entrance_exam_id: '1', entrance_exam_minimum_score_pct: 0.65, entrance_exam_passed: false,
      },
    };
    const testStore = await initializeTestStore({ courseMetadata: testCourseMetadata, unitBlocks }, false);
    // Have to refetch the sequenceId since the new store generates new sequences
    const { courseware } = testStore.getState();
    const testData = { ...mockData, sequenceId: courseware.sequenceId };

    renderNav({ ...testData, unitId: unitBlocks[0].id }, { store: testStore });

    expect(await screen.findByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('has the "Next" button enabled for entrance exam pass', async () => {
    const testCourseMetadata = {
      ...courseMetadata,
      certificate_data: { cert_status: 'bogus_status' },
      enrollment: { is_active: true },
      entrance_exam_data: {
        entrance_exam_current_score: 1.0, entrance_exam_enabled: true, entrance_exam_id: '1', entrance_exam_minimum_score_pct: 0.65, entrance_exam_passed: true,
      },
    };
    const testStore = await initializeTestStore({ courseMetadata: testCourseMetadata, unitBlocks }, false);
    // Have to refetch the sequenceId since the new store generates new sequences
    const { courseware } = testStore.getState();
    const testData = { ...mockData, sequenceId: courseware.sequenceId };

    renderNav({ ...testData, unitId: unitBlocks[0].id }, { store: testStore });

    await waitFor(() => expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href'));
    expect(screen.getByRole('link', { name: /next/i })).toBeEnabled();
  });

  it('displays end of course message instead of the "Next" button as needed', async () => {
    const testCourseMetadata = { ...courseMetadata, certificate_data: { cert_status: 'notpassing' }, enrollment: { is_active: true } };
    const testStore = await initializeTestStore({ courseMetadata: testCourseMetadata, unitBlocks }, false);
    // Have to refetch the sequenceId since the new store generates new sequences
    const { courseware } = testStore.getState();
    const testData = { ...mockData, sequenceId: courseware.sequenceId };

    renderNav({ ...testData, unitId: unitBlocks[unitBlocks.length - 1].id }, { store: testStore });

    expect(await screen.findByRole('link', { name: /next \(end of course\)/i })).toBeEnabled();
    expect(screen.getByRole('link', { name: /previous/i })).toBeEnabled();
  });

  it('displays complete course message instead of the "Next" button as needed', async () => {
    const testCourseMetadata = {
      ...courseMetadata,
      certificate_data: { cert_status: 'downloadable' },
      enrollment: { is_active: true },
      user_has_passing_grade: true,
    };
    const testStore = await initializeTestStore({ courseMetadata: testCourseMetadata, unitBlocks }, false);
    // Have to refetch the sequenceId since the new store generates new sequences
    const { courseware } = testStore.getState();
    const testData = { ...mockData, sequenceId: courseware.sequenceId };

    renderNav({ ...testData, unitId: unitBlocks[unitBlocks.length - 1].id }, { store: testStore });

    expect(await screen.findByRole('link', { name: /Complete the course/i })).toBeEnabled();
    expect(screen.getByRole('link', { name: /previous/i })).toBeEnabled();
  });
});
