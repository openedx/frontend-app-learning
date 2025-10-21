# Learner Tools Slot

### Slot ID: `org.openedx.frontend.learning.learner_tools.v1`

### Slot ID Aliases
* `learner_tools_slot`

### Description
This plugin slot provides a location for learner-facing tools and features to be displayed during course content navigation. The slot is rendered via a React portal to `document.body` to ensure proper positioning and stacking context.

### Props:
* `courseId` - The unique identifier for the current course
* `unitId` - The unique identifier for the current unit/vertical being viewed
* `userId` - The authenticated user's ID (automatically retrieved from auth context)
* `isStaff` - Boolean indicating whether the user has staff/instructor privileges
* `enrollmentMode` - The user's enrollment mode (e.g., 'audit', 'verified', 'honor', etc.)

### Usage
Plugins registered to this slot can use the provided context to:
- Display course-specific tools based on courseId and unitId
- Show different features based on user's enrollment mode
- Provide staff-only functionality when isStaff is true
- Query additional data from Redux store or backend APIs as needed

### Notes
- Returns `null` if user is not authenticated
- Plugins should manage their own feature flag checks and requirements
- The slot uses a portal to render to `document.body` for flexible positioning
