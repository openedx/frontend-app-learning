import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import CourseBreadcrumb from './CourseBreadcrumb';

export default function CourseBreadcrumbs({
  courseUsageKey, courseId, sequenceId, unitId, models,
}) {
  const links = useMemo(() => {
    const sectionId = models[sequenceId].parentId;
    if (!unitId) {
      return [];
    }
    return [courseId, sectionId, sequenceId, unitId].map((nodeId) => {
      const node = models[nodeId];
      return {
        id: node.id,
        label: node.displayName,
        url: `${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/course/#${node.id}`,
      };
    });
  }, [courseUsageKey, courseId, sequenceId, unitId, models]);

  return (
    <nav aria-label="breadcrumb">
      <ol className="list-inline">
        {links.map(({ id, url, label }, i) => (
          <CourseBreadcrumb key={id} url={url} label={label} last={i === links.length - 1} />
        ))}
      </ol>
    </nav>
  );
}

CourseBreadcrumbs.propTypes = {
  courseUsageKey: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  models: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.string),
    parentId: PropTypes.string,
  })).isRequired,
};

CourseBreadcrumbs.defaultProps = {
  unitId: null,
};
