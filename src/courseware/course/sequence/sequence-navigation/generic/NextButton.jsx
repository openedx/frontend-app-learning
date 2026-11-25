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

import UnitNavigationEffortEstimate from '../UnitNavigationEffortEstimate';

const NextButton = ({
  onClickHandler,
  buttonText,
  nextLink,
  variant,
  buttonStyle,
  disabled,
  hasEffortEstimate = false,
  isAtTop = false,
}) => {
  const navigate = useNavigate();
  const buttonContent = hasEffortEstimate ? (
    <UnitNavigationEffortEstimate>
      {buttonText}
    </UnitNavigationEffortEstimate>
  ) : buttonText;

  const getNextArrow = () => {
    if (isAtTop) {
      return isRtl(getLocale()) ? ArrowBack : ArrowForward;
    }
    return isRtl(getLocale()) ? ChevronLeft : ChevronRight;
  };

  const nextArrow = getNextArrow();

  const onClick = () => {
    navigate(nextLink);
    onClickHandler();
  };

  if (isAtTop) {
    return (
      <IconButton
        className={`${buttonStyle} icon-hover`}
        onClick={onClick}
        src={nextArrow}
        disabled={disabled}
        iconAs={Icon}
        alt={buttonText}
      />
    );
  }

  return (
    <Button
      variant={variant}
      className={buttonStyle}
      disabled={disabled}
      onClick={onClickHandler}
      as={disabled ? undefined : Link}
      to={disabled ? undefined : nextLink}
      iconAfter={nextArrow}
    >
      {buttonContent}
    </Button>
  );
};


NextButton.propTypes = {
  onClickHandler: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  nextLink: PropTypes.string,
  variant: PropTypes.string.isRequired,
  buttonStyle: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  hasEffortEstimate: PropTypes.bool,
  isAtTop: PropTypes.bool,
};

export default NextButton;
