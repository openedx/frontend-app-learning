import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@openedx/frontend-base';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import { useMinimalCourseOutline, useIsCourseLoaded, useSequenceMetadata } from '@src/courseware/data/apiHooks';
import { getCourseOutlineUrl } from '@src/courseware/urls';
import BreadcrumbItem from './BreadcrumbItem';

const CourseBreadcrumbs = ({
  courseId,
  sectionId,
  sequenceId,
  unitId,
  isStaff,
  jumpNav = false,
}) => {
  const isCourseLoaded = useIsCourseLoaded(courseId);
  const sequenceQuery = useSequenceMetadata(sequenceId, { enabled: false });
  const { courses, sections, sequences } = useMinimalCourseOutline(courseId, { enabled: false }).data ?? {};
  const courseSections = courses ? courses[courseId].sectionIds.map((id) => sections[id]) : [];

  const allSequencesInSections = Object.fromEntries(
    courseSections.map((section) => [
      section.id,
      {
        default: section.id === sectionId,
        title: section.title,
        sequences: section.sequenceIds.map((id) => sequences[id]),
      },
    ]),
  );

  const links = useMemo(() => {
    const chapters = [];
    const sequentials = [];
    if (isCourseLoaded && sequenceQuery.isSuccess) {
      Object.entries(allSequencesInSections).forEach(([id, section]) => {
        chapters.push({
          id,
          label: section.title,
          default: section.default,
          sequences: section.sequences,
        });
        if (section.default) {
          section.sequences.forEach((sequence) => {
            sequentials.push({
              id: sequence.id,
              label: sequence.title,
              default: sequence.id === sequenceId,
              sequences: [sequence],
            });
          });
        }
      });
    }
    return [chapters, sequentials];
  }, [isCourseLoaded, sequenceQuery.isSuccess, allSequencesInSections, sequenceId]);

  return (
    <nav aria-label="breadcrumb" className="d-inline-block col-sm-10 mb-3">
      <ol className="list-unstyled d-flex flex-nowrap align-items-center m-0">
        <li className="list-unstyled col-auto m-0 p-0">
          <Link
            className="flex-shrink-0 text-primary"
            to={getCourseOutlineUrl(courseId)}
            replace
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <FormattedMessage
              id="learn.breadcrumb.navigation.course.home"
              description="The course home link in breadcrumbs nav"
              defaultMessage="Course"
            />
          </Link>
        </li>
        {links.map((content, i) => (
          <BreadcrumbItem
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            courseId={courseId}
            sequenceId={sequenceId}
            content={content}
            unitId={unitId}
            withSeparator
            separator="/"
            isStaff={isStaff}
            jumpNav={jumpNav}
          />
        ))}
      </ol>
    </nav>
  );
};

CourseBreadcrumbs.propTypes = {
  courseId: PropTypes.string.isRequired,
  sectionId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  isStaff: PropTypes.bool,
  jumpNav: PropTypes.bool,
};

export default CourseBreadcrumbs;
