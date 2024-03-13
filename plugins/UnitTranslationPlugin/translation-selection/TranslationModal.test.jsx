import { shallow } from '@edx/react-unit-test-utils';

import TranslationModal from './TranslationModal';

jest.mock('./useTranslationModal', () => ({
  __esModule: true,
  default: () => ({
    selectedIndex: 0,
    setSelectedIndex: jest.fn(),
    onSubmit: jest.fn().mockName('onSubmit'),
  }),
}));
jest.mock('@edx/paragon', () => jest.requireActual('@edx/react-unit-test-utils').mockComponents({
  StandardModal: 'StandardModal',
  ActionRow: {
    Spacer: 'Spacer',
  },
  Button: 'Button',
  Icon: 'Icon',
  ListBox: 'ListBox',
  ListBoxOption: 'ListBoxOption',
}));
jest.mock('@edx/paragon/icons', () => ({
  Check: jest.fn().mockName('icons.Check'),
}));
jest.mock('@edx/frontend-platform/i18n', () => {
  const i18n = jest.requireActual('@edx/frontend-platform/i18n');
  const { formatMessage } = jest.requireActual('@edx/react-unit-test-utils');
  // this provide consistent for the test on different platform/timezone
  const formatDate = jest.fn(date => new Date(date).toISOString()).mockName('useIntl.formatDate');
  return {
    ...i18n,
    useIntl: jest.fn(() => ({
      formatMessage,
      formatDate,
    })),
    defineMessages: m => m,
    FormattedMessage: () => 'FormattedMessage',
  };
});

describe('TranslationModal', () => {
  const props = {
    isOpen: true,
    close: jest.fn().mockName('close'),
    selectedLanguage: 'en',
    setSelectedLanguage: jest.fn().mockName('setSelectedLanguage'),
    id: 'plugin-test-id',
  };
  it('renders correctly', () => {
    const wrapper = shallow(<TranslationModal {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
