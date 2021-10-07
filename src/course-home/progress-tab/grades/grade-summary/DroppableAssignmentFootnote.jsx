import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import { useModel } from '../../../../generic/model-store';

function DroppableAssignmentFootnote({ footnotes, intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);
  return (
    <>
      <span id="grade-summary-footnote-label" className="sr-only">{intl.formatMessage(messages.footnotesTitle)}</span>
      <ul className="list-unstyled mt-2">
        {footnotes.map((footnote, index) => (
          <li id={`${footnote.id}-footnote`} key={footnote.id} className="x-small mt-1">
            <sup>{index + 1}</sup>
            <FormattedMessage
              id="progress.footnotes.droppableAssignments"
              defaultMessage="The lowest {numDroppable, plural, one{# {assignmentType} score is} other{# {assignmentType} scores are}} dropped."
              values={{
                numDroppable: footnote.numDroppable,
                assignmentType: footnote.assignmentType,
              }}
            />
            <a className="sr-only" href={`#${footnote.id}-ref`} tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}>
              {intl.formatMessage(messages.backToContent)}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

DroppableAssignmentFootnote.propTypes = {
  footnotes: PropTypes.arrayOf(PropTypes.shape({
    assignmentType: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    numDroppable: PropTypes.number.isRequired,
  })).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DroppableAssignmentFootnote);
