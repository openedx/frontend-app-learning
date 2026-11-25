# Slots

The slots Learning offers. Each has a directory here with its component, its README and its test. The README gives the slot's props, what it renders by default, and `site.config` examples.

Every slot's ID is exported from the package as a constant, with the type of the props its widgets receive. For the `unitTitle` slot, for instance:

```ts
import { unitTitleSlotId, type UnitTitleSlotProps } from '@openedx/frontend-app-learning';
```

All IDs share the prefix `org.openedx.frontend.slot.learning.` and end in `.v1`. The table gives the part in between.

Each tab's section starts with the slot that holds the whole tab (`outlineTab`, `datesTab`, `progressTab`, `liveTab`, `coursewareTab`). Its default is the tab itself, as a widget Learning registers under an ID of its own: see the [widgets](../widgets/README.md#the-tabs). The other slots in the section sit inside that widget.

For the operations Learning applies to other apps' slots (the shell's header and course bar), see `src/slots.tsx` and the [widgets](../widgets/README.md). See frontend-base's [ADR 0009](https://github.com/openedx/frontend-base/blob/main/docs/decisions/0009-slot-naming-and-lifecycle.rst) for slot naming and lifecycle.

## Course Outline tab

| Slot | ID | Constant |
|---|---|---|
| [Outline Tab](./OutlineTabSlot/README.md) | `outlineTab` | `outlineTabSlotId` |
| [Course Home Section Outline](./CourseHomeSectionOutlineSlot/README.md) | `courseHomeSectionOutline` | `courseHomeSectionOutlineSlotId` |
| [Course Outline Tab Notifications](./CourseOutlineTabNotificationsSlot/README.md) | `courseOutlineTabNotifications` | `courseOutlineTabNotificationsSlotId` |

## Dates tab

| Slot | ID | Constant |
|---|---|---|
| [Dates Tab](./DatesTabSlot/README.md) | `datesTab` | `datesTabSlotId` |
| [Banner Dates Upgrade](./BannerDatesUpgradeSlot/README.md) | `bannerDatesUpgrade` | `bannerDatesUpgradeSlotId` |

## Progress tab

| Slot | ID | Constant |
|---|---|---|
| [Progress Tab](./ProgressTabSlot/README.md) | `progressTab` | `progressTabSlotId` |
| [Progress Certificate Status](./ProgressCertificateStatusSlot/README.md) | `progressCertificateStatus` | `progressCertificateStatusSlotId` |
| [Progress Tab Certificate Status Main Body](./ProgressTabCertificateStatusMainBodySlot/README.md) | `progressTabCertificateStatusMainBody` | `progressTabCertificateStatusMainBodySlotId` |
| [Progress Tab Certificate Status Side Panel](./ProgressTabCertificateStatusSidePanelSlot/README.md) | `progressTabCertificateStatusSidePanel` | `progressTabCertificateStatusSidePanelSlotId` |
| [Progress Tab Course Completion](./ProgressTabCourseCompletionSlot/README.md) | `progressTabCourseCompletion` | `progressTabCourseCompletionSlotId` |
| [Progress Tab Course Grade](./ProgressTabCourseGradeSlot/README.md) | `progressTabCourseGrade` | `progressTabCourseGradeSlotId` |
| [Progress Tab Grade Breakdown](./ProgressTabGradeBreakdownSlot/README.md) | `progressTabGradeBreakdown` | `progressTabGradeBreakdownSlotId` |
| [Progress Tab Related Links](./ProgressTabRelatedLinksSlot/README.md) | `progressTabRelatedLinks` | `progressTabRelatedLinksSlotId` |

## Live tab

| Slot | ID | Constant |
|---|---|---|
| [Live Tab](./LiveTabSlot/README.md) | `liveTab` | `liveTabSlotId` |

## Courseware: sequence and unit

| Slot | ID | Constant |
|---|---|---|
| [Courseware Tab](./CoursewareTabSlot/README.md) | `coursewareTab` | `coursewareTabSlotId` |
| [Course Breadcrumbs](./CourseBreadcrumbsSlot/README.md) | `courseBreadcrumbs` | `courseBreadcrumbsSlotId` |
| [Sequence Navigation](./SequenceNavigationSlot/README.md) | `sequenceNavigation` | `sequenceNavigationSlotId` |
| [Unit Title](./UnitTitleSlot/README.md) | `unitTitle` | `unitTitleSlotId` |
| [Next Unit Top Nav Trigger](./NextUnitTopNavTriggerSlot/README.md) | `nextUnitTopNavTrigger` | `nextUnitTopNavTriggerSlotId` |
| [Gated Unit Content Message](./GatedUnitContentMessageSlot/README.md) | `gatedUnitContentMessage` | `gatedUnitContentMessageSlotId` |
| [Unit Content](./UnitContentSlot/README.md) | `unitContent` | `unitContentSlotId` |
| [Content IFrame Loader](./ContentIFrameLoaderSlot/README.md) | `contentIFrameLoader` | `contentIFrameLoaderSlotId` |
| [Content IFrame Error](./ContentIFrameErrorSlot/README.md) | `contentIFrameError` | `contentIFrameErrorSlotId` |
| [Sequence Bottom Navigation](./SequenceBottomNavigationSlot/README.md) | `sequenceBottomNavigation` | `sequenceBottomNavigationSlotId` |
| [Sequence Container](./SequenceContainerSlot/README.md) | `sequenceContainer` | `sequenceContainerSlotId` |
| [Learner Tools](./LearnerToolsSlot/README.md) | `learnerTools` | `learnerToolsSlotId` |
| [Submitted Timed Exam Instructions](./SubmittedTimedExamInstructionsSlot/README.md) | `submittedTimedExamInstructions` | `submittedTimedExamInstructionsSlotId` |

## Courseware: navigation sidebar

The course outline, beside the unit. See also the [navigation sidebar's README](../courseware/course/sidebar/sidebars/course-outline/README.md).

| Slot | ID | Constant |
|---|---|---|
| [Course Outline Sidebar](./CourseOutlineSidebarSlot/README.md) | `courseOutlineSidebar` | `courseOutlineSidebarSlotId` |
| [Course Outline Sidebar Trigger](./CourseOutlineSidebarTriggerSlot/README.md) | `courseOutlineSidebarTrigger` | `courseOutlineSidebarTriggerSlotId` |
| [Course Outline Mobile Sidebar Trigger](./CourseOutlineMobileSidebarTriggerSlot/README.md) | `courseOutlineMobileSidebarTrigger` | `courseOutlineMobileSidebarTriggerSlotId` |
| [Course Outline Sidebar Heading](./CourseOutlineSidebarHeadingSlot/README.md) | `courseOutlineSidebarHeading` | `courseOutlineSidebarHeadingSlotId` |
| [Course Outline Sidebar Completion Icon](./CourseOutlineSidebarCompletionIconSlot/README.md) | `courseOutlineSidebarCompletionIcon` | `courseOutlineSidebarCompletionIconSlotId` |
| [Course Outline Sidebar Unit](./CourseOutlineSidebarUnitSlot/README.md) | `courseOutlineSidebarUnit` | `courseOutlineSidebarUnitSlotId` |

## Courseware: auxiliary sidebar

The panels beside the unit, and their triggers above it. The [sidebar README](../courseware/course/sidebar/README.md) explains how to add a sidebar widget.

| Slot | ID | Constant |
|---|---|---|
| [Auxiliary Sidebar](./AuxiliarySidebarSlot/README.md) | `auxiliarySidebar` | `auxiliarySidebarSlotId` |
| [Auxiliary Sidebar Trigger](./AuxiliarySidebarTriggerSlot/README.md) | `auxiliarySidebarTrigger` | `auxiliarySidebarTriggerSlotId` |

## Course exit page

All three are documented in one [README](./CourseExitSlots/README.md).

| Slot | ID | Constant |
|---|---|---|
| [Course Exit View Courses](./CourseExitSlots/README.md#course-exit-view-courses-slot) | `courseExitViewCourses` | `courseExitViewCoursesSlotId` |
| [Course Recommendations](./CourseExitSlots/README.md#course-recommendations-slot) | `courseRecommendations` | `courseRecommendationsSlotId` |
| [Course Exit Dashboard Footnote Link](./CourseExitSlots/README.md#course-exit-dashboard-footnote-link-slot) | `courseExitDashboardFootnoteLink` | `courseExitDashboardFootnoteLinkSlotId` |
