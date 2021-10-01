/* eslint-disable consistent-return */
import React from 'react';
import PropTypes from 'prop-types';
import { history } from '@edx/frontend-platform';
import { Button, MenuItem } from '@edx/paragon';

import {
  sendTrackingLogEvent,
  sendTrackEvent,
} from '@edx/frontend-platform/analytics';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { checkBlockCompletion } from '../data';

export function JumpNavMenuItem({
  title,
  courseId,
  currentUnit,
  sequences,
  isDefault,
  actions,

}) {
  function logEvent(targetUrl) {
    const eventName = 'edx.ui.lms.jump_nav.selected';
    const payload = {
      target_name: title,
      id: targetUrl,
      current_id: courseId,
      widget_placement: 'breadcrumb',
    };
    sendTrackEvent(eventName, payload);
    sendTrackingLogEvent(eventName, payload);
  }

  function lazyloadUrl() {
    if (isDefault) {
      return `/course/${courseId}/${currentUnit}`;
    }
    const destinationString = sequences.forEach(sequence => sequence.unitIds.forEach(unitId => {
      const complete = actions.checkBlockCompletion(
        courseId,
        sequence.id, unitId,
      )
        .then(value => value);
      if (!complete) { return `/course/${courseId}/${unitId}`; }
    }));
    return destinationString || `/course/${courseId}/${sequences[0].unitIds[0]}`;
  }
  function handleClick() {
    const url = lazyloadUrl();
    logEvent(url);
    history.push(url);
  }

  return (
    <MenuItem
      as={Button}
      defaultSelected={isDefault}
      onClick={() => handleClick()}
    >
      {title}
    </MenuItem>
  );
}

const sequenceShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  sectionId: PropTypes.string.isRequired,
  isTimeLimited: PropTypes.bool,
  isProctored: PropTypes.bool,
  legacyWebUrl: PropTypes.string,
});

JumpNavMenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  sequences: PropTypes.arrayOf(sequenceShape).isRequired,
  isDefault: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  currentUnit: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    checkBlockCompletion: PropTypes.func,
  }).isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ checkBlockCompletion }, dispatch),
  };
}

export default connect(null,
  mapDispatchToProps)(JumpNavMenuItem);
