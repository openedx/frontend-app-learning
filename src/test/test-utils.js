import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render as rtlRender, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from '@edx/frontend-platform/node_modules/react-intl';
import { reducer as modelsReducer } from '../model-store';
import { reducer as coursewareReducer } from '../data';


function render(
  ui,
  {
    initialState = {},
    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
      },
      preloadedState: initialState,
    }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <IntlProvider locale="en">
        <Provider store={store}>
          {children}
        </Provider>
      </IntlProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

// override `render` method; export `screen` too to suppress errors
export { render, screen };
