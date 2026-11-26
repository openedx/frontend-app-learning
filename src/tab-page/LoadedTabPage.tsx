import React, { type ComponentType, type ReactNode } from 'react';

import { Container, useToggle } from '@openedx/paragon';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { AlertList } from '@src/generic/user-messages';
import StreakModal from '@src/shared/streak-celebration';

// The components an AlertList renders for its custom alert codes, keyed by code.
export type CustomAlerts = Record<string, ComponentType<never>>;

// What a tab hands the frame for the frame to place. The frame knows nothing of any particular tab.
export interface FrameContentProps {
  // Alerts for the region at the top of the page, above the content (the user messages of topic `outline`).
  pageAlerts?: CustomAlerts;
  // Banners for the region beneath the shell's masquerade bar (topic `instructor-toolbar-alerts`).
  masqueradeBanners?: CustomAlerts;
  // Renders what has to stay hidden while the streak celebration is open, such as a tab's product tours.
  renderTours?: (state: { isStreakCelebrationOpen: boolean }) => ReactNode;
  // The content renders its own <main> landmark, so the frame wraps it in a <div> instead.
  ownsMainLandmark?: boolean;
}

interface LoadedTabPageProps extends FrameContentProps {
  children?: ReactNode;
  courseId: string;
}

const LoadedTabPage = ({
  children = null,
  courseId,
  pageAlerts = {},
  masqueradeBanners = {},
  renderTours,
  ownsMainLandmark = false,
}: LoadedTabPageProps) => {
  const metadataQuery = useCourseHomeMeta(courseId, { enabled: false });

  const [isStreakCelebrationOpen,, closeStreakCelebration] = useToggle(
    !!metadataQuery.data?.celebrations?.streakLengthToCelebrate,
  );

  if (!metadataQuery.isSuccess) {
    throw new Error(`LoadedTabPage rendered without course metadata for ${courseId}`);
  }
  const {
    celebrations,
    verifiedMode,
  } = metadataQuery.data;

  const streakLengthToCelebrate = celebrations && celebrations.streakLengthToCelebrate;
  const streakDiscountCouponEnabled = celebrations && celebrations.streakDiscountEnabled && verifiedMode;

  // The courseware renders its own <main> landmark inside <Sequence> so the sidebar navigation stays outside of it.
  // Every other tab gets the <main> landmark below, wrapping only the page children (not the alerts or tab
  // navigation).
  const ContentWrapper = ownsMainLandmark ? 'div' : 'main';

  return (
    <>
      {renderTours?.({ isStreakCelebrationOpen: !!isStreakCelebrationOpen })}
      {/* The shell's masquerade bar renders above the page; these banners, which the legacy app's instructor toolbar
          rendered beneath it, are Learning's own. Both only show while staff masquerade. */}
      <AlertList
        topic="instructor-toolbar-alerts"
        customAlerts={masqueradeBanners}
      />
      <StreakModal
        courseId={courseId}
        streakLengthToCelebrate={streakLengthToCelebrate}
        isStreakCelebrationOpen={!!isStreakCelebrationOpen}
        closeStreakCelebration={closeStreakCelebration}
        streakDiscountCouponEnabled={streakDiscountCouponEnabled}
        verifiedMode={verifiedMode}
      />
      <div className="d-flex flex-column flex-grow-1">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={pageAlerts}
        />
        <Container as={ContentWrapper} size="xl" className="d-flex flex-column flex-grow-1 mt-3">
          {children}
        </Container>
      </div>
    </>
  );
};

export default LoadedTabPage;
