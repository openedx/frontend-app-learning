import React from 'react';
import PropTypes from 'prop-types';
import { Toast } from '@edx/paragon';

import './LearningToast.scss';

export default function LearningToast({
  bodyLink,
  bodyText,
  header,
  onClose,
  show,
}) {
  return (
    <Toast
      onClose={onClose}
      show={show}
      delay={5000}
      autohide
      className="bg-gray-700 learning-toast"
      style={{
        boxShadow: 'none',
        position: 'fixed',
        zIndex: 2,
      }}
    >
      <Toast.Header className="bg-gray-700 border-bottom-0 p-0 text-light justify-content-between align-items-center">
        <p className="small m-0 mr-4">{header}</p>
      </Toast.Header>
      {bodyLink && bodyText && (
        <Toast.Body className="bg-gray-700 text-light p-0 pt-3">
          <a className="btn btn-sm btn-outline-light" href={bodyLink}>{bodyText}</a>
        </Toast.Body>
      )}
    </Toast>
  );
}

LearningToast.propTypes = {
  bodyLink: PropTypes.string,
  bodyText: PropTypes.string,
  header: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

LearningToast.defaultProps = {
  bodyLink: null,
  bodyText: null,
  header: null,
};
