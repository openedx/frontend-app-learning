import React from 'react';
import PropTypes from 'prop-types';
import { Toast } from '@edx/paragon';

import './LearningToast.scss';

export default function LearningToast({
  body,
  header,
  onClose,
  show,
}) {
  return (
    <Toast
      onClose={onClose}
      show={show}
      delay={3000}
      autohide
      style={{
        boxShadow: 'none',
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 2,
      }}
    >
      <Toast.Header className="bg-gray-700 border-bottom-0 text-light">
        <div dangerouslySetInnerHTML={{ __html: header }} />
      </Toast.Header>
      <Toast.Body className="bg-gray-700 text-light">
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </Toast.Body>
    </Toast>
  );
}

LearningToast.propTypes = {
  body: PropTypes.string,
  header: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

LearningToast.defaultProps = {
  body: null,
  header: null,
};
