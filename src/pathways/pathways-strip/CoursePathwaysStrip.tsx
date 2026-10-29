import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { generatePath, Link } from 'react-router-dom';

import { DECODE_ROUTES } from '@src/constants';

import { useCoursePathways } from '../data/apiHooks';
import type { PathwayData } from '../data/types';
import { MorePathwaysPopover } from './MorePathwaysPopover';
import { useVisiblePathways } from './hooks';
import messages from './messages';

interface PathwayLabelProps {
  pathway: PathwayData;
  isMeasure?: boolean;
}

export interface CoursePathwaysStripProps {
  courseId?: string;
}

const PathwayLabel = ({ pathway, isMeasure = false }: PathwayLabelProps) => (
  <Link
    to={generatePath(DECODE_ROUTES.PATHWAY_OUTLINE, { pathwayId: pathway.pathway.id })}
    className="course-pathways-strip-label text-white"
    tabIndex={isMeasure ? -1 : undefined}
  >
    {pathway.pathway.content.displayName}
  </Link>
);

export const CoursePathwaysStrip = ({ courseId }: CoursePathwaysStripProps) => {
  const { data: pathways = [] } = useCoursePathways(courseId);
  const {
    containerRef,
    measureRef,
    visiblePathways,
    hiddenPathways,
  } = useVisiblePathways(pathways);

  if (!pathways.length) {
    return null;
  }

  return (
    <div className="course-pathways-strip bg-primary text-white small">
      <div className="container-xl d-flex align-items-center py-2">
        <span className="text-gray-200 flex-shrink-0 mr-3">
          <FormattedMessage {...messages.includedIn} />
        </span>
        <div ref={containerRef} className="course-pathways-strip-container d-flex align-items-center">
          {visiblePathways.map((pathway) => (
            <PathwayLabel key={pathway.pathway.id} pathway={pathway} />
          ))}
          {hiddenPathways.length > 0 && <MorePathwaysPopover pathways={hiddenPathways} />}
          <div ref={measureRef} className="course-pathways-strip-measure d-flex align-items-center" aria-hidden>
            {pathways.map((pathway) => (
              <PathwayLabel key={pathway.pathway.id} pathway={pathway} isMeasure />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
