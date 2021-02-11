import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PluginErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div>Plugin failed to load.</div>;
    }

    return this.props.children;
  }
}

PluginErrorBoundary.propTypes = {
  children: PropTypes.node,
};

PluginErrorBoundary.defaultProps = {
  children: null,
};
