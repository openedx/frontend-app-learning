import PropTypes from 'prop-types';

// https://github.com/openedx/frontend-app-learning/issues/2185
const ProgressCertificateStatusSlot = ({ children }) => (
  <>
    {children}
  </>
);

ProgressCertificateStatusSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ProgressCertificateStatusSlot;
