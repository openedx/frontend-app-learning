import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

function InstructorToolbar(props) {
  // TODO: Only render this toolbar if the user is course staff
  if (!props.activeUnitLmsWebUrl) {
    return null;
  }

  return (
    <div className="bg-primary text-light">
      <div className="container-fluid py-2 d-flex justify-content-end">
        <a className="text-light" href={props.activeUnitLmsWebUrl}>View unit in the existing experience</a>
      </div>
    </div>
  );
}

InstructorToolbar.propTypes = {
  activeUnitLmsWebUrl: PropTypes.string,
};

InstructorToolbar.defaultProps = {
  activeUnitLmsWebUrl: undefined,
};

const mapStateToProps = (state, props) => {
  if (!props.unitId) {
    return {};
  }

  const activeUnit = state.courseBlocks.blocks[props.unitId];
  return {
    activeUnitLmsWebUrl: activeUnit.lmsWebUrl,
  };
};

export default connect(mapStateToProps)(InstructorToolbar);
