import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@openedx/paragon';

import { sendTrackEvent, sendTrackingLogEvent } from '@openedx/frontend-base';
import { useNavigate } from 'react-router-dom';

import { getSequenceUrl, getUnitUrl } from '@src/courseware/urls';

const JumpNavMenuItem = ({
  title,
  courseId,
  currentSequence,
  currentUnit,
  sequences,
  isDefault,
  onClick,
}) => {
  const navigate = useNavigate();

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
      return getUnitUrl(courseId, currentSequence, currentUnit);
    }
    return getSequenceUrl(courseId, sequences[0].id);
  }
  function handleClick(e) {
    const url = destinationUrl();
    logEvent(url);
    navigate(url);
    if (onClick) { onClick(e); }
  }

  return (
    <Dropdown.Item
      active={isDefault}
      onClick={e => handleClick(e)}
    >
      {title}
    </Dropdown.Item>
  );
};

const sequenceShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
});

JumpNavMenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  sequences: PropTypes.arrayOf(sequenceShape).isRequired,
  isDefault: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  currentSequence: PropTypes.string,
  currentUnit: PropTypes.string,
  onClick: PropTypes.func,
};

export default JumpNavMenuItem;
