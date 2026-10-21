import React from 'react';
import { Helmet } from 'react-helmet';

import { getConfig } from '@edx/frontend-platform';
import { useToggle } from '@openedx/paragon';

import { CourseTabsNavigationSlot } from '@src/plugin-slots/CourseTabsNavigationSlot';
import { getActiveTabTitle } from '@src/course-tabs/utils';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { AlertList } from '@src/generic/user-messages';
import useEnrollmentAlert from '@src/alerts/enrollment-alert';
import useLogistrationAlert from '@src/alerts/logistration-alert';
import StreakModal from '@src/shared/streak-celebration';
import InstructorToolbar from '@src/instructor-toolbar';

import ProductTours from '../product-tours/ProductTours';

interface LoadedTabPageProps {
  activeTabSlug: string;
  children?: React.ReactNode;
  courseId: string;
  unitId?: string | null;
}

const LoadedTabPage = ({
  activeTabSlug,
  children = null,
  courseId,
  unitId = null,
}: LoadedTabPageProps) => {
  const metadataQuery = useCourseHomeMeta(courseId, { enabled: false });

  // Logistration and enrollment alerts are only really used for the outline tab, but loaded here to put them above
  // breadcrumbs when they are visible.
  const logistrationAlert = useLogistrationAlert(courseId);
  const enrollmentAlert = useEnrollmentAlert(courseId);

  const [isStreakCelebrationOpen,, closeStreakCelebration] = useToggle(
    !!metadataQuery.data?.celebrations?.streakLengthToCelebrate,
  );

  if (!metadataQuery.isSuccess) {
    throw new Error(`LoadedTabPage rendered without course metadata for ${courseId}`);
  }
  const {
    celebrations,
    org,
    originalUserIsStaff,
    tabs,
    title,
    verifiedMode,
    hasCourseAuthorAccess,
  } = metadataQuery.data;

  const activeTabTitle = getActiveTabTitle(tabs, activeTabSlug);

  const streakLengthToCelebrate = celebrations && celebrations.streakLengthToCelebrate;
  const streakDiscountCouponEnabled = celebrations && celebrations.streakDiscountEnabled && verifiedMode;

  return (
    <>
      <ProductTours
        activeTab={activeTabSlug}
        courseId={courseId}
        isStreakCelebrationOpen={isStreakCelebrationOpen}
        org={org}
      />
      <Helmet>
        <title>{`${activeTabTitle ? `${activeTabTitle} | ` : ''}${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      {originalUserIsStaff && (
        <InstructorToolbar
          courseId={courseId}
          unitId={unitId}
          tab={activeTabSlug}
          isStudioButtonVisible={hasCourseAuthorAccess}
        />
      )}
      <StreakModal
        courseId={courseId}
        streakLengthToCelebrate={streakLengthToCelebrate}
        isStreakCelebrationOpen={!!isStreakCelebrationOpen}
        closeStreakCelebration={closeStreakCelebration}
        streakDiscountCouponEnabled={streakDiscountCouponEnabled}
        verifiedMode={verifiedMode}
      />
      <main className="d-flex flex-column flex-grow-1">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...enrollmentAlert,
            ...logistrationAlert,
          }}
        />
        <CourseTabsNavigationSlot tabs={tabs} activeTabSlug={activeTabSlug} />
        <div id="main-content" className="container-xl">
          {children}
        </div>
      </main>
    </>
  );
};

export default LoadedTabPage;
