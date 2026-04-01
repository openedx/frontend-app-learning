import PropTypes from 'prop-types';

const DashedCircleIcon = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="20"
      cy="20"
      r="15"
      stroke="#ccc"
      strokeWidth="3"
      strokeDasharray="2.6 2.3"
      fill="transparent"
      strokeDashoffset="27"
    />
    <circle
      cx="20"
      cy="20"
      r="15"
      fill="transparent"
      stroke="#0d7d4d"
      strokeWidth="3"
      strokeDasharray={`${props.percentage} ${props.remainder}`}
      strokeDashoffset="29"
    />
  </svg>
);

DashedCircleIcon.propTypes = {
  percentage: PropTypes.number.isRequired,
  remainder: PropTypes.number.isRequired,
};

export default DashedCircleIcon;
