import React, { Component } from 'react';
import { Button } from '@edx/paragon';

export default class SubSectionNavigation extends Component {
  renderUnits() {
    return this.props.subSection.children.map((unitId) => {
      const unit = this.props.models[unitId];
      return (
        <Button
          key={unitId}
          className="btn-outline-secondary unit-button"
          onClick={() => this.props.unitClickHandler(unitId)}
        >
          {unit.displayName}
        </Button>
      );
    });
  }

  render() {
    return (
      <nav>
        <Button key="previous" className="btn-outline-primary">Previous</Button>
        {this.renderUnits()}
        <Button key="next" className="btn-outline-primary">Next</Button>

      </nav>
    );
  }
}
