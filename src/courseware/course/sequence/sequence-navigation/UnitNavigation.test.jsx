import React from 'react';
import { Factory } from 'rosie';
import {
  render, screen, fireEvent, initializeTestStore,
} from '../../../../setupTest';
import UnitNavigation from './UnitNavigation';

describe('Unit Navigation', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata', {
    certificate_data: {
      cert_status: 'notpassing', // some interesting status that will trigger the last unit button to be active
    },
  });
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    const { courseware } = store.getState();
    mockData = {
      unitId: unitBlocks[1].id,
      sequenceId: courseware.sequenceId,
      onClickPrevious: () => {},
      onClickNext: () => {},
      goToCourseExitPage: () => {},
    };
  });

  it('renders correctly without units', () => {
    render(<UnitNavigation
      {...mockData}
      sequenceId=""
      unitId=""
      onClickPrevious={() => {}}
      onClickNext={() => {}}
    />);

    // Only "Previous" and "Next" buttons should be rendered.
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('handles the clicks', () => {
    const onClickPrevious = jest.fn();
    const onClickNext = jest.fn();

    render(<UnitNavigation
      {...mockData}
      sequenceId=""
      unitId=""
      onClickPrevious={onClickPrevious}
      onClickNext={onClickNext}
    />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onClickPrevious).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onClickNext).toHaveBeenCalledTimes(1);
  });

  it('has the navigation buttons enabled for the non-corner unit in the sequence', () => {
    render(<UnitNavigation {...mockData} />);

    screen.getAllByRole('button').forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('has the "Previous" button disabled for the first unit in the sequence', () => {
    render(<UnitNavigation {...mockData} unitId={unitBlocks[0].id} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('displays end of course message instead of the "Next" button as needed', () => {
    render(<UnitNavigation {...mockData} unitId={unitBlocks[unitBlocks.length - 1].id} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /next \(end of course\)/i })).toBeEnabled();
  });
});
