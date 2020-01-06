import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faBook, faPencilAlt, faTasks } from '@fortawesome/free-solid-svg-icons';

export default class SubSectionNavigation extends Component {
  renderUnitIcon(type) {
    let icon = null;
    switch (type) {
      case 'video':
        icon = faFilm;
        break;
      case 'other':
        icon = faBook;
        break;
      case 'vertical':
        icon = faTasks;
        break;
      case 'problem':
        icon = faPencilAlt;
        break;
      default:
        icon = faBook;
    }
    return <FontAwesomeIcon icon={icon} />;
  }

  renderUnits() {
    return this.props.unitIds.map((id) => {
      const { type } = this.props.units[id];
      const disabled = this.props.activeUnitId === id;
      return (
        <Button
          key={id}
          className="btn-outline-secondary unit-button"
          onClick={() => this.props.unitClickHandler(id)}
          disabled={disabled}
        >
          {this.renderUnitIcon(type)}
        </Button>
      );
    });
  }

  render() {
    return (
      <nav>
        <Button
          key="previous"
          className="btn-outline-primary"
          onClick={this.props.previousClickHandler}
        >
          Previous
        </Button>
        {this.renderUnits()}
        <Button
          key="next"
          className="btn-outline-primary"
          onClick={this.props.nextClickHandler}
        >
          Next
        </Button>
      </nav>
    );
  }
}

SubSectionNavigation.propTypes = {
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  units: PropTypes.objectOf(PropTypes.shape({
    pageTitle: PropTypes.string.isRequired,
    type: PropTypes.oneOf('video', 'other', 'vertical', 'problem').isRequired,
  })).isRequired,
  activeUnitId: PropTypes.string.isRequired,
  unitClickHandler: PropTypes.func.isRequired,
  nextClickHandler: PropTypes.func.isRequired,
  previousClickHandler: PropTypes.func.isRequired,
};
