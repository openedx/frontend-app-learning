import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import SidebarSection from './SidebarSection';

describe('<SidebarSection />', () => {
  let mockHandleSelectSection;
  const section = {
    id: 'section1',
    complete: false,
    title: 'Section 1',
    completionStat: {
      completed: 2,
      total: 4,
    },
  };

  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <SidebarSection
        section={section}
        handleSelectSection={mockHandleSelectSection}
        {...props}
      />,
    </IntlProvider>
  );

  beforeEach(() => {
    mockHandleSelectSection = jest.fn();
  });

  it('renders correctly when section is incomplete', () => {
    const { getByText, getByTestId } = render(<RootWrapper />);

    expect(getByText(section.title)).toBeInTheDocument();
    expect(getByText(`, ${courseOutlineMessages.incompleteSection.defaultMessage}`)).toBeInTheDocument();
    expect(getByTestId('dashed-circle-icon')).toBeInTheDocument();

    const button = getByText(section.title);
    userEvent.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });

  it('renders correctly when section is complete', () => {
    const { getByText, getByTestId } = render(
      <RootWrapper section={{ ...section, completionStat: { completed: 4, total: 4 }, complete: true }} />,
    );

    expect(getByText(section.title)).toBeInTheDocument();
    expect(getByText(`, ${courseOutlineMessages.completedSection.defaultMessage}`)).toBeInTheDocument();
    expect(getByTestId('check-circle-icon')).toBeInTheDocument();

    const button = getByText(section.title);
    userEvent.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });
});
