import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Button } from '@edx/paragon';

import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';
import BookmarkFilledIcon from './bookmark/BookmarkFilledIcon';

function UnitButton({
  onClick,
  displayName,
  contentType,
  isActive,
  bookmarked,
  complete,
  showCompletion,
  unitId,
  className,
  showTitle,
}) {
  const handleClick = useCallback(() => {
    onClick(unitId);
  });

  return (
    <Button
      className={classNames({
        active: isActive,
        complete: showCompletion && complete,
      }, className)}
      onClick={handleClick}
      title={displayName}
    >
      <UnitIcon type={contentType} />
      {showTitle && <span className="unit-title">{displayName}</span>}
      {showCompletion && complete ? <CompleteIcon size="sm" className="text-success ml-2" /> : null}
      {bookmarked ? (
        <BookmarkFilledIcon
          className="text-primary small position-absolute"
          style={{ top: '-3px', right: '5px' }}
        />
      ) : null}
    </Button>
  );
}

UnitButton.propTypes = {
  unitId: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  bookmarked: PropTypes.bool,
  complete: PropTypes.bool,
  showCompletion: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  displayName: PropTypes.string.isRequired,
  contentType: PropTypes.string.isRequired,
  className: PropTypes.string,
  showTitle: PropTypes.bool,
};

UnitButton.defaultProps = {
  className: undefined,
  isActive: false,
  bookmarked: false,
  complete: false,
  showTitle: false,
  showCompletion: true,
};

const mapStateToProps = (state, props) => ({
  ...state.courseBlocks.blocks[props.unitId],
});

export default connect(mapStateToProps)(UnitButton);
