import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import courseOutlineMessages from '../../../../../course-home/outline-tab/messages';
import SidebarSection from './SidebarSection';

describe('<SidebarSection />', () => {
  let mockHandleSelectSection;
  const section = {
    id: 'section1',
    complete: false,
    title: 'Section 1',
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
    const { getByText, container } = render(<RootWrapper />);

    expect(getByText(section.title)).toBeInTheDocument();
    expect(screen.getByText(`, ${courseOutlineMessages.incompleteSection.defaultMessage}`)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();

    const button = getByText(section.title);
    userEvent.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });

  it('renders correctly when section is complete', () => {
    const { getByText, container } = render(
      <RootWrapper section={{ ...section, complete: true }} />,
    );

    expect(getByText(section.title)).toBeInTheDocument();
    expect(screen.getByText(`, ${courseOutlineMessages.completedSection.defaultMessage}`)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).toBeInTheDocument();

    const button = getByText(section.title);
    userEvent.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });
});
