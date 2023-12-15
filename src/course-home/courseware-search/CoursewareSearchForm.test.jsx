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

function renderComponent(placeholder, onSubmit, onChange) {
  const { container } = render(<CoursewareSearchForm
    placeholder={placeholder}
    onSubmit={onSubmit}
    onChange={onChange}
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

  afterEach(() => {
    jest.clearAllMocks();
  });
});
