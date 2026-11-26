import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { Button, IconButton, Icon } from '@openedx/paragon';
import {
  ArrowBack,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
} from '@openedx/paragon/icons';
import { getLocale, isRtl } from '@openedx/frontend-base';

const PreviousButton = ({
  onClick,
  buttonLabel,
  previousLink,
  variant,
  buttonStyle,
  isFirstUnit,
  isAtTop = false,
}) => {
  const navigate = useNavigate();
  const disabled = isFirstUnit || !previousLink;

  const getPrevArrow = () => {
    if (isAtTop) {
      return isRtl(getLocale()) ? ArrowForward : ArrowBack;
    }
    return isRtl(getLocale()) ? ChevronRight : ChevronLeft;
  };

  const prevArrow = getPrevArrow();

  const onClickHandler = () => {
    navigate(previousLink);
    onClick();
  };

  if (isAtTop) {
    return (
      <IconButton
        className={`${buttonStyle} icon-hover`}
        onClick={onClickHandler}
        src={prevArrow}
        disabled={disabled}
        iconAs={Icon}
        alt={buttonLabel}
      />
    );
  }

  return (
    <Button
      variant={variant}
      className={buttonStyle}
      disabled={disabled}
      onClick={onClick}
      as={disabled ? undefined : Link}
      to={disabled ? undefined : previousLink}
      iconBefore={prevArrow}
    >
      {buttonLabel}
    </Button>
  );
};

PreviousButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string,
  previousLink: PropTypes.string,
  variant: PropTypes.string.isRequired,
  buttonStyle: PropTypes.string.isRequired,
  isFirstUnit: PropTypes.bool.isRequired,
  isAtTop: PropTypes.bool,
};

export default PreviousButton;
