import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapsible } from '@edx/paragon';

function InstructorToolbar(props) {
  // TODO: Only render this toolbar if the user is course staff
  if (!props.activeUnitLmsWebUrl) {
    return null;
  }

  return (
    <div className="bg-primary text-light">
      <div className="container-fluid py-3 d-md-flex justify-content-end align-items-center">
        <div className="flex-grow-1">
          <p className="mr-5 mb-md-0">
            <Collapsible.Advanced>
              You are currently previewing the new learning sequence experience.
              <Collapsible.Trigger className="d-inline-block ml-2" style={{ cursor: 'pointer' }}>
                <Collapsible.Visible whenClosed>
                  <span style={{ borderBottom: 'solid 1px white' }}>More info</span> &rarr;
                </Collapsible.Visible>
              </Collapsible.Trigger>
              <Collapsible.Body>
                This preview is to allow for early content testing, especially for custom content blocks, with the goal of ensuring it renders as expected in the next experience. You can learn more through the following <a className="text-white" style={{ textDecoration: 'underline' }} href="https://partners.edx.org/announcements/author-preview-learning-sequence-experience-update" target="blank" rel="noopener">Partner Portal post</a>.  Please report any issues or provide <a className="text-white" style={{ textDecoration: 'underline' }} target="blank" rel="noopener" href="https://forms.gle/R6jMYJNTCj1vgC1D6">feedback using the linked form</a>.
                <Collapsible.Trigger className="d-inline-block ml-2" style={{ cursor: 'pointer' }}>
                  <Collapsible.Visible whenOpen>
                    <span style={{ borderBottom: 'solid 1px white' }}>Close</span> &times;
                  </Collapsible.Visible>
                </Collapsible.Trigger>
              </Collapsible.Body>
            </Collapsible.Advanced>
          </p>
        </div>
        <div className="flex-shrink-0">
          <a className="btn d-block btn-outline-light" href={props.activeUnitLmsWebUrl}>View unit in the existing experience</a>
        </div>
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
