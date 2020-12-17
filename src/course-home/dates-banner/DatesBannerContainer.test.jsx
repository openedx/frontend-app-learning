import React from 'react';
import { Factory } from 'rosie';
import {
  render, screen, fireEvent, getByText, initializeTestStore,
} from '../../setupTest';
import DatesBannerContainer from './DatesBannerContainer';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';
import SequenceNavigation from "../../courseware/course/sequence/sequence-navigation/SequenceNavigation";

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../generic/tabs/useIndexOfLastVisibleChild');
useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);

describe('Dates Banner Container', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'problem' },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    const { courseware } = store.getState();
    mockData = {
      courseDateBlocks: {},
      datesBannerInfo: {},
      hasEnded: false,
      model: 'dates',
      tabFetch: jest.fn(),
    };
  });

  it('is empty while loading', async () => {
    const { container } = render(<DatesBannerContainer {...mockData} unitId={undefined} />);
    expect(getByText(container, (content, element) => (
      element.tagName.toLowerCase() === 'div' && element.getAttribute('style')))).toBeEmptyDOMElement();
  });

});
