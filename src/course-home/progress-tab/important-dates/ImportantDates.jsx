import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

import { useModel } from '../../../generic/model-store';
import { useContextId } from '../../../data/hooks';
import { fetchDatesTab } from '../../data/thunks';

import messages from './messages';
import './ImportantDates.scss';

// Date types worth surfacing in this card, beyond just assignment due dates
// (matches the Figma design, which shows course-level milestones like
// "Course starts" alongside assignment due dates).
const RELEVANT_DATE_TYPES = ['assignment-due-date', 'course-start-date', 'course-end-date'];

/**
 * ImportantDates card rendered in the Progress tab side panel, above Related Links.
 * The dates model is normally loaded when the Dates tab is opened; the
 * fallback fetch allows the card to work on direct Progress-tab navigation.
 */
const ImportantDates = () => {
  const intl = useIntl();
  const courseId = useContextId();
  const dispatch = useDispatch();
  const nowRef = useRef(new Date());
  const fetchStartedRef = useRef(false);

  const datesModel = useModel('dates', courseId);
  const { courseDateBlocks } = datesModel;
  const datesLoaded = Object.prototype.hasOwnProperty.call(datesModel, 'courseDateBlocks');

  useEffect(() => {
    if (courseId && !datesLoaded && !fetchStartedRef.current) {
      fetchStartedRef.current = true;
      dispatch(fetchDatesTab(courseId));
    }
  }, [courseId, datesLoaded, dispatch]);

  const importantDates = useMemo(() => {
    const now = nowRef.current;
    if (!Array.isArray(courseDateBlocks) || courseDateBlocks.length === 0) {
      return [];
    }
    let foundNextDue = false;
    return courseDateBlocks
      .filter((block) => block.learnerHasAccess && RELEVANT_DATE_TYPES.includes(block.dateType))
      .map((block) => {
        const parsedDate = new Date(block.date);
        const isToday = parsedDate.toDateString() === now.toDateString();
        const isPast = parsedDate < now && !isToday;
        if (!foundNextDue && !isPast && !block.complete) {
          foundNextDue = true;
          return { ...block, dueNext: true };
        }
        return block;
      })
      .filter((block) => {
        const parsedDate = new Date(block.date);
        const isToday = parsedDate.toDateString() === now.toDateString();
        const isPast = parsedDate < now && !isToday;
        const isFuture = parsedDate > now;
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentlyCompleted = block.complete && parsedDate >= sevenDaysAgo;
        return isToday || isFuture || isPast || recentlyCompleted;
      })
      .slice(0, 4);
  }, [courseDateBlocks]);

  const hasBlocks = Array.isArray(courseDateBlocks) && courseDateBlocks.length > 0;
  const now = nowRef.current;

  let body = null;
  if (!datesLoaded) {
    body = <div className="important-dates-note">{intl.formatMessage(messages.loadingDates)}</div>;
  } else if (!hasBlocks || importantDates.length === 0) {
    body = <div className="important-dates-note">{intl.formatMessage(messages.noImportantDates)}</div>;
  } else {
    body = (
      <ul className="important-dates-list">
        {importantDates.map((dateInfo, index) => {
          const parsedDate = new Date(dateInfo.date);
          const isToday = parsedDate.toDateString() === now.toDateString();
          const isPast = parsedDate < now && !isToday;
          // Per Figma: the checkmark means "done" - for assignment due dates that
          // means actually completed (not just past-due), while course-level
          // milestones (start/end) have no completion state, so "past" applies.
          const isPastOrCompleted = dateInfo.dateType === 'assignment-due-date'
            ? dateInfo.complete === true
            : isPast;
          const isLast = index === importantDates.length - 1;

          // One badge per row, in priority order. Today takes precedence over
          // everything; the rest only apply to assignment due dates, since
          // course-level milestones (start/end) have no due/complete concept.
          let badge = null;
          if (isToday) {
            badge = { message: messages.today, className: 'important-dates-today-badge' };
          } else if (dateInfo.dateType === 'assignment-due-date') {
            if (!dateInfo.complete && isPast) {
              badge = { message: messages.pastDue, className: 'important-dates-pastdue-badge' };
            } else if (dateInfo.dueNext) {
              badge = { message: messages.dueNext, className: 'important-dates-duenext-badge' };
            } else if (dateInfo.complete) {
              badge = { message: messages.completed, className: 'important-dates-completed-badge' };
            }
          }

          return (
            <li key={`${dateInfo.title}-${dateInfo.date}-${dateInfo.assignmentType || ''}`} className="important-dates-item">
              <div className="important-dates-timeline">
                <div className={classNames('important-dates-dot', { completed: isPastOrCompleted })}>
                  {isPastOrCompleted ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCircle} />}
                </div>
                {!isLast && <div className="important-dates-line" />}
              </div>
              <div className="important-dates-content">
                <div className="important-dates-date-row">
                  <span className="important-dates-date">
                    <FormattedDate value={parsedDate} day="numeric" month="short" weekday="short" year="numeric" />
                  </span>
                  {badge && (
                    <span className={badge.className}>
                      {intl.formatMessage(badge.message)}
                    </span>
                  )}
                </div>
                {dateInfo.title && (
                  <div className="important-dates-note">
                    {dateInfo.assignmentType && `${dateInfo.assignmentType}: `}
                    {dateInfo.title}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="important-dates-card mb-4">
      <h3 className="important-dates-title">{intl.formatMessage(messages.importantDates)}</h3>
      {body}
    </div>
  );
};

export default ImportantDates;
