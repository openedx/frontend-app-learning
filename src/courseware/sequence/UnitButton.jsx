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
}) {
  const handleClick = useCallback(() => {
    onClick(unitId);
  });

  return (
    <Button
      className={classNames({
        active: isActive,
        'btn-outline-primary': !isActive,
        'btn-outline-secondary': isActive,
      })}

      onClick={handleClick}
      title={displayName}
    >
      <UnitIcon type={contentType} />
      {showCompletion && complete ? <CompleteIcon className="text-success ml-2" /> : null}
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
};

UnitButton.defaultProps = {
  isActive: false,
  bookmarked: false,
  complete: false,
  showCompletion: true,
};

const mapStateToProps = (state, props) => ({
  ...state.courseBlocks.blocks[props.unitId],
});

export default connect(mapStateToProps)(UnitButton);
