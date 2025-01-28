import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { ChevronLeft, ChevronRight } from '@openedx/paragon/icons';
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
}) => {
  const nextArrow = isRtl(getLocale()) ? ChevronLeft : ChevronRight;
  const { pathname } = useLocation();
  const navLink = pathname.startsWith('/preview') ? `/preview${nextLink}` : nextLink;
  const buttonContent = hasEffortEstimate ? (
    <UnitNavigationEffortEstimate>
      {buttonText}
    </UnitNavigationEffortEstimate>
  ) : buttonText;

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
};

export default NextButton;
