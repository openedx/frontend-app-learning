import React from 'react';
import PropTypes from 'prop-types';
import { history } from '@edx/frontend-platform';
import { MenuItem } from '@edx/paragon';

import {
  sendTrackingLogEvent,
  sendTrackEvent,
} from '@edx/frontend-platform/analytics';

export default function JumpNavMenuItem({
  title,
  courseId,
  currentSequence,
  currentUnit,
  sequences,
  isDefault,
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

  function destinationUrl() {
    if (isDefault) {
      return `/course/${courseId}/${currentSequence}/${currentUnit}`;
    }
    return `/course/${courseId}/${sequences[0].id}`;
  }
  function handleClick() {
    const url = destinationUrl();
    logEvent(url);
    history.push(url);
  }

  return (
    <MenuItem
      defaultSelected={isDefault}
      onClick={() => handleClick()}
    >
      {title}
    </MenuItem>
  );
}

const sequenceShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
});

JumpNavMenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  sequences: PropTypes.arrayOf(sequenceShape).isRequired,
  isDefault: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  currentSequence: PropTypes.string.isRequired,
  currentUnit: PropTypes.string.isRequired,
};
