import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Footnote({ icon, text }) {
  return (
    <div className="row w-100 mx-0 my-4 justify-content-center">
      <p className="text-gray-700">
        <FontAwesomeIcon icon={icon} style={{ width: '20px' }} />&nbsp;
        {text}
      </p>
    </div>
  );
}

Footnote.propTypes = {
  icon: PropTypes.shape({}).isRequired,
  text: PropTypes.node.isRequired,
};

export default Footnote;
