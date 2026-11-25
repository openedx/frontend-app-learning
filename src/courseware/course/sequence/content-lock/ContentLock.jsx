import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';

import { getSequenceUrl } from '@src/courseware/urls';

import messages from './messages';

const ContentLock = ({
  courseId, prereqSectionName, prereqId, sequenceTitle,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    navigate(getSequenceUrl(courseId, prereqId));
  }, [courseId, prereqId, navigate]);

  return (
    <>
      <h3>
        <FontAwesomeIcon icon={faLock} />
        {' '}
        {sequenceTitle}
      </h3>
      <h4>{intl.formatMessage(messages['learn.contentLock.content.locked'])}</h4>
      <p>
        {intl.formatMessage(messages['learn.contentLock.complete.prerequisite'], {
          prereqSectionName,
        })}
      </p>
      <p>
        <Button variant="primary" onClick={handleClick}>{intl.formatMessage(messages['learn.contentLock.goToSection'])}</Button>
      </p>
    </>
  );
};
ContentLock.propTypes = {
  courseId: PropTypes.string.isRequired,
  prereqSectionName: PropTypes.string.isRequired,
  prereqId: PropTypes.string.isRequired,
  sequenceTitle: PropTypes.string.isRequired,
};
export default ContentLock;
