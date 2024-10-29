import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { ChevronLeft, ChevronRight } from '@openedx/paragon/icons';
import { isRtl, getLocale } from '@edx/frontend-platform/i18n';

const PreviousButton = ({
  onClick,
  buttonLabel,
  previousLink,
  variant,
  buttonStyle,
  isFirstUnit,
}) => {
  const disabled = isFirstUnit;
  const prevArrow = isRtl(getLocale()) ? ChevronRight : ChevronLeft;
  const { pathname } = useLocation();
  const navLink = pathname.startsWith('/preview') ? `/preview${previousLink}` : previousLink;

  return (
    <Button
      variant={variant}
      className={buttonStyle}
      disabled={disabled}
      onClick={onClick}
      as={disabled ? undefined : Link}
      to={disabled ? undefined : navLink}
      iconBefore={prevArrow}
    >
      {buttonLabel}
    </Button>
  );
};

PreviousButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  previousLink: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
  buttonStyle: PropTypes.string.isRequired,
  isFirstUnit: PropTypes.bool.isRequired,
};

export default PreviousButton;
