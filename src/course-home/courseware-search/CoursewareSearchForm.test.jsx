import React from 'react';
import {
  act,
  initializeMockApp,
  render,
  screen,
  waitFor,
  fireEvent,
} from '../../setupTest';
import CoursewareSearchForm from './CoursewareSearchForm';

function renderComponent(placeholder, onSubmit, onChange, labelledBy) {
  const { container } = render(<CoursewareSearchForm
    placeholder={placeholder}
    onSubmit={onSubmit}
    onChange={onChange}
    labelledBy={labelledBy}
  />);
  return container;
}

describe('CoursewareSearchToggle', () => {
  const placeholderText = 'Search for courseware';
  let onSubmitHandlerMock;
  let onChangeHandlerMock;

  beforeAll(async () => {
    onChangeHandlerMock = jest.fn();
    onSubmitHandlerMock = jest.fn();
    initializeMockApp();
  });

  it('should render', async () => {
    await act(async () => renderComponent(placeholderText, onSubmitHandlerMock, onChangeHandlerMock));
    await waitFor(() => {
      expect(screen.queryByTestId('courseware-search-form')).toBeInTheDocument();
    });
  });

  it('should call onChange handler when input changes', async () => {
    await act(async () => renderComponent(placeholderText, onSubmitHandlerMock, onChangeHandlerMock));
    await waitFor(() => {
      const element = screen.queryByPlaceholderText(placeholderText);
      fireEvent.change(element, { target: { value: 'test' } });
      expect(onChangeHandlerMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onSubmit handler when submit is clicked', async () => {
    await act(async () => renderComponent(placeholderText, onSubmitHandlerMock, onChangeHandlerMock));
    await waitFor(async () => {
      const element = await screen.findByTestId('courseware-search-form-submit');
      fireEvent.click(element);
      expect(onSubmitHandlerMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should associate the input with an external label via aria-labelledby', async () => {
    await act(async () => renderComponent(placeholderText, onSubmitHandlerMock, onChangeHandlerMock, 'external-id'));
    const input = await screen.findByRole('searchbox');
    expect(input).toHaveAttribute('aria-labelledby', 'external-id');
  });

  it('should not render a visually-hidden duplicate "Search" label', async () => {
    let container;
    await act(async () => { container = renderComponent(placeholderText, onSubmitHandlerMock, onChangeHandlerMock, 'external-id'); });
    // Guards against re-introducing <SearchField.Label />, which renders an sr-only duplicate label.
    expect(container.querySelector('label.sr-only, label .sr-only')).toBeNull();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
