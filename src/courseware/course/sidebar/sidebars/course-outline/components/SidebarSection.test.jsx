import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeTestStore } from '@src/setupTest';
import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import SidebarSection from './SidebarSection';

describe('<SidebarSection />', () => {
  let mockHandleSelectSection;
  let store;
  let section;

  const initTestStore = async (options) => {
    store = await initializeTestStore(options);
    const state = store.getState();
    const [activeSectionId] = Object.keys(state.courseware.courseOutline.sections);
    section = state.courseware.courseOutline.sections[activeSectionId];
  };

  const RootWrapper = (props) => (
    <AppProvider store={store} wrapWithRouter={false}>
      <IntlProvider locale="en">
        <SidebarSection
          section={section}
          handleSelectSection={mockHandleSelectSection}
          {...props}
        />,
      </IntlProvider>
    </AppProvider>
  );

  beforeEach(() => {
    mockHandleSelectSection = jest.fn();
  });

  it('renders correctly when section is incomplete', async () => {
    await initTestStore();
    const { getByText, container } = render(<RootWrapper />);

    expect(getByText(section.title)).toBeInTheDocument();
    expect(getByText(`, ${courseOutlineMessages.incompleteSection.defaultMessage}`)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();

    const button = getByText(section.title);
    userEvent.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });

  it('renders correctly when section is complete', async () => {
    await initTestStore();
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
