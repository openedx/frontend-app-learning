import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useModel, useModels } from '../../../generic/model-store';
import BreadcrumbItem from './BreadcrumbItem';

const CourseBreadcrumbs = ({
  courseId,
  sectionId,
  sequenceId,
  unitId,
  isStaff,
}) => {
  const course = useModel('coursewareMeta', courseId);  
  const courseStatus = useSelector((state) => state.courseware.courseStatus);
  const sequenceStatus = useSelector(
    (state) => state.courseware.sequenceStatus,
  );
  console.log( useModels('sections', course.sectionIds));
  

  const allSequencesInSections = Object.fromEntries(
    useModels('sections', course.sectionIds)?.map((section) => [
      section.id,
      {
        default: section.id === sectionId,
        title: section.title,
        sequences: useModels('sequences', section.sequenceIds),
      },
    ]),
  );

  const links = useMemo(() => {
    const chapters = [];
    const sequentials = [];
    if (courseStatus === 'loaded' && sequenceStatus === 'loaded') {
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
  }, [courseStatus, sequenceStatus, allSequencesInSections]);
  console.log(links);
   

  return (
    <nav aria-label="breadcrumb" className="d-inline-block col-sm-10 mb-3">
      <ol className="list-unstyled d-flex flex-nowrap align-items-center m-0">
        <li className="list-unstyled col-auto m-0 p-0">
          <Link
            className="flex-shrink-0 text-primary"
            to={`/course/${courseId}/home`}
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
};

CourseBreadcrumbs.defaultProps = {
  sectionId: null,
  sequenceId: null,
  unitId: null,
  isStaff: null,
};

export default CourseBreadcrumbs;
