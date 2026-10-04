import classNames from 'classnames';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useCoursePathways } from './data/apiHooks';
import type { PathwayData } from './data/types';
import { MorePathwaysPopover } from './MorePathwaysPopover';
import { useVisiblePathways } from './hooks';
import messages from './messages';

interface PathwayLabelProps {
  pathway: PathwayData;
  isTruncated?: boolean;
}

export interface CoursePathwaysStripProps {
  courseId?: string;
}

const PathwayLabel = ({
  pathway,
  isTruncated = false,
}: PathwayLabelProps) => (
  // TODO Link to the pathway outline once its URL is known
  <span className={classNames('course-pathways-strip-label', { 'is-truncated': isTruncated })}>
    {pathway.pathway.content.displayName}
  </span>
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
          {visiblePathways.map((pathway, index) => (
            <PathwayLabel
              key={pathway.pathway.id}
              pathway={pathway}
              isTruncated={hiddenPathways.length > 0 && index === visiblePathways.length - 1}
            />
          ))}
          {hiddenPathways.length > 0 && <MorePathwaysPopover pathways={hiddenPathways} />}
          <div ref={measureRef} className="course-pathways-strip-measure d-flex align-items-center" aria-hidden>
            {pathways.map((pathway) => (
              <PathwayLabel key={pathway.pathway.id} pathway={pathway} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
