import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const LocalIFrame = ({
  children,
  title,
  ...props
}) => {
  const [contentRef, setContentRef] = React.useState(null);
  const mountNode = contentRef?.contentWindow?.document?.body;
  return (
    <iframe title={title} {...props} ref={setContentRef}>
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};

LocalIFrame.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};
export default LocalIFrame;
