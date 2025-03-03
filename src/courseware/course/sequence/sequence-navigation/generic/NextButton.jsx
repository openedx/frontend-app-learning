import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, IconButton, Icon } from '@openedx/paragon';
import {
  ArrowBack,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
} from '@openedx/paragon/icons';
import { isRtl, getLocale } from '@edx/frontend-platform/i18n';

import UnitNavigationEffortEstimate from '../UnitNavigationEffortEstimate';

const NextButton = ({
  onClickHandler,
  buttonText,
  nextLink,
  variant,
  buttonStyle,
  disabled,
  hasEffortEstimate,
  isAtTop,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navLink = pathname.startsWith('/preview') ? `/preview${nextLink}` : nextLink;
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
    navigate(navLink);
    onClickHandler();
  };

  if (isAtTop) {
    return (
      <IconButton
        variant="light"
        className={buttonStyle}
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
      to={disabled ? undefined : navLink}
      iconAfter={nextArrow}
    >
      {buttonContent}
    </Button>
  );
};

NextButton.defaultProps = {
  hasEffortEstimate: false,
};

NextButton.propTypes = {
  onClickHandler: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  nextLink: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
  buttonStyle: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  hasEffortEstimate: PropTypes.bool,
  isAtTop: PropTypes.bool.isRequired,
};

export default NextButton;
