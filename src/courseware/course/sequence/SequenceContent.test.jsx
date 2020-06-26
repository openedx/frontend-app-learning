import React from 'react';
import { render, screen } from '../../../test/test-utils';
import SequenceContent from './SequenceContent';

describe('Sequence Content', () => {
  window.scrollTo = jest.fn();
  // HACK: Mock the MutationObserver as it's breaking async testing.
  //  According to StackOverflow it should be fixed in `jest-environment-jsdom` v16,
  //  but upgrading `jest` to v26 didn't fix this problem.
  //  ref: https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor
  global.MutationObserver = class {
    // eslint-disable-next-line no-unused-vars,no-useless-constructor,no-empty-function
    constructor(callback) {}

    disconnect() {}

    // eslint-disable-next-line no-unused-vars
    observe(element, initObject) {}
  };

  const testUnits = [...Array(10).keys()].map(i => String(i + 1));
  const initialState = {
    courseware: {
      sequenceStatus: 'loaded',
      courseStatus: 'loaded',
      courseId: '1',
    },
    models: {
      courses: {
        1: {
          sectionIds: ['1'],
        },
      },
      sections: {
        1: {
          sequenceIds: ['1', '2'],
        },
      },
      sequences: {
        1: {
          unitIds: testUnits,
          showCompletion: true,
          title: 'test-sequence',
          gatedContent: {
            prereqId: '1',
            gatedSectionName: 'test-gated-section',
          },
        },
      },
      units: testUnits.reduce(
        (acc, unitId) => Object.assign(acc, {
          [unitId]: {
            id: unitId,
            contentType: 'other',
            title: unitId,
          },
        }),
        {},
      ),
    },
  };

  const mockData = {
    gated: false,
    courseId: '1',
    sequenceId: '1',
    unitId: '1',
    unitLoadedHandler: () => {},
    intl: {},
  };

  it('displays loading message', () => {
    const { asFragment } = render(<SequenceContent {...mockData} />, { initialState });
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays messages for the locked content', async () => {
    const { asFragment } = render(<SequenceContent {...mockData} gated />, { initialState });
    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();

    expect(await screen.findByText(/content locked/i)).toBeInTheDocument();
    expect(screen.getByText('test-sequence')).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays message for no content', () => {
    const { asFragment } = render(<SequenceContent {...mockData} unitId={null} />, { initialState });
    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
