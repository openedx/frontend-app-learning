import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Toast } from '@edx/paragon';
import { Link } from 'react-router-dom';

import './LearningToast.scss';

function LearningToast({
  intl,
  body,
  header,
  link,
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
        <div className="mr-auto">{intl.formatMessage(header)}</div>
      </Toast.Header>
      <Toast.Body className="bg-gray-700 text-light">
        <Link className="text-light" to={link}>{intl.formatMessage(body)}</Link>
      </Toast.Body>
    </Toast>
  );
}

LearningToast.propTypes = {
  body: PropTypes.shape({
    possible: PropTypes.number,
    earned: PropTypes.number,
    graded: PropTypes.bool,
  }).isRequired,
  header: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }).isRequired,
  intl: intlShape.isRequired,
  link: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default injectIntl(LearningToast);
