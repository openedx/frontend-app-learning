import { useState } from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import FeedbackWidget from './index';
import useFeedbackWidget from './useFeedbackWidget';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((value) => [value, jest.fn()]),
}));
jest.mock('@openedx/paragon', () => jest.requireActual('@edx/react-unit-test-utils').mockComponents({
  ActionRow: {
    Spacer: 'Spacer',
  },
  IconButton: 'IconButton',
  Icon: 'Icon',
}));
jest.mock('@openedx/paragon/icons', () => ({
  Close: 'Close',
  ThumbUpOutline: 'ThumbUpOutline',
  ThumbDownOffAlt: 'ThumbDownOffAlt',
}));
jest.mock('./useFeedbackWidget');
jest.mock('@edx/frontend-platform/i18n', () => {
  const i18n = jest.requireActual('@edx/frontend-platform/i18n');
  const { formatMessage } = jest.requireActual('@edx/react-unit-test-utils');
  return {
    ...i18n,
    useIntl: jest.fn(() => ({
      formatMessage,
    })),
  };
});

describe('<FeedbackWidget />', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    translationLanguage: 'es',
    unitId:
      'block-v1:edX+DemoX+Demo_Course+type@vertical+block@37b72b3915204b70acb00c55b604b563',
    userId: '123',
  };

  const mockUseFeedbackWidget = ({ showFeedbackWidget, showGratitudeText }) => {
    useFeedbackWidget.mockReturnValueOnce({
      closeFeedbackWidget: jest.fn().mockName('closeFeedbackWidget'),
      sendFeedback: jest.fn().mockName('sendFeedback'),
      onThumbsUpClick: jest.fn().mockName('onThumbsUpClick'),
      onThumbsDownClick: jest.fn().mockName('onThumbsDownClick'),
      showFeedbackWidget,
      showGratitudeText,
    });
  };

  it('renders hidden by default', () => {
    mockUseFeedbackWidget({
      showFeedbackWidget: true,
      showGratitudeText: true,
    });
    const wrapper = shallow(<FeedbackWidget {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
    expect(wrapper.instance.findByType('div')[0].props.className).toContain(
      'd-none',
    );
  });

  it('renders show when elemReady is true', () => {
    mockUseFeedbackWidget({
      showFeedbackWidget: true,
      showGratitudeText: true,
    });
    useState.mockReturnValueOnce([true, jest.fn()]);
    const wrapper = shallow(<FeedbackWidget {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
    expect(wrapper.instance.findByType('div')[0].props.className).not.toContain(
      'd-none',
    );
  });

  it('render empty when showFeedbackWidget and showGratitudeText are false', () => {
    mockUseFeedbackWidget({
      showFeedbackWidget: false,
      showGratitudeText: false,
    });
    const wrapper = shallow(<FeedbackWidget {...props} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });
  it('render feedback widget', () => {
    mockUseFeedbackWidget({
      showFeedbackWidget: true,
      showGratitudeText: false,
    });
    const wrapper = shallow(<FeedbackWidget {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
  it('render gratitude text', () => {
    mockUseFeedbackWidget({
      showFeedbackWidget: false,
      showGratitudeText: true,
    });
    const wrapper = shallow(<FeedbackWidget {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
