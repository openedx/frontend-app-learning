# Direction of Courseware APIs

In order to allow for greater flexibility and separation of concerns, we're going to stop using the Course Blocks API for navigational data, and pull that data from the Learning Sequences Outlines API instead. The intention is to give us four distinct layers of courseware that can eventually be composed in different ways:

* Learning Context Metadata
* Learning Context Navigation
* Sequence Navigation
* Unit Rendering

Note that "Learning Context" is a generalization of "Course" that includes other things like Content Libraries, Learning Pathways, and potentially other logical groupings of content.

This is a refinement of [0002-courseware-page-decisions.md](0002-courseware-page-decisions.md). The fundamental layers remain the same, but this document tries to better clarify the boundaries and path forward for these layers. We're not making these layers completely swappable/pluggable now, but we should separate the data access in a way that allows for that in the future.

## Background

We currently make four primary requests to the LMS when rendering courseware instructional content:

1. Course Metadata: `/api/courseware/course/{courseId}` (REST API)
2. Course Blocks API: `/api/courses/v2/blocks/?course_id={courseId}` (REST API)
3. Sequence Metadata: `/api/courseware/sequence/{sequenceUsageKey}` (REST API)
4. Unit: `/xblock/{unitBlockUsageKey}` (rendered in an iframe)

There is a significant amount of overlap between the Course Blocks API and the others at the moment, since Course Blocks takes a static snapshot of the entire tree of course content at once. There are a few problems with the current arrangement:

* It's slow and complex. The Course Blocks API can be difficult to maintain and reason about, and trickier to optimize.
* Assuming that all course structures are the same makes it difficult to support other content types, like LabXchange Learning Pathways or adaptive content.
* The overlap between Course Blocks and the other APIs means that there can be conflicts about the state.

## Motivating Vision

We have seen a desire to extend or enhance the courseware experience in various ways:

Learning Context Navigation
* Allowing for shorter, human-readable URLs in courseware.
* Smaller courses that do not need the current navigational hierarchy.
* LabXchange pathways.

Sequence Navigation
* Adaptive content, where the full list of units is not known up front.
* More limited navigation, where content is pushed linearly, without the ability to jump ahead.
* Different layouts for content browsing.

Unit Rendering
* Use of QTI content (currently serviced by cc2olx conversion).
* Desire to experiment with a next-gen version of XBlock.
* Use of entirely LTI units.

The idea would be to insulate each layer from the layers above and below it. Sequence rendering shouldn't be affected by whether or not it's in a two level hierarchy (Course → Section → Sequence), or a flat one (Course → Sequence). Learning Context Navigation should be able to reference Sequences without caring if a Sequence is an adaptive one or not. Sequences should be able to have a common interface to call Unit iframes, whether those Units are rendering XBlocks or QTI content.

Note that supporting these types of course structures would require downstream changes in other systems as well (e.g. analytics).

## Next Step: Removing use of the Course Blocks API.

The next step in this process is to remove the call to the Course Blocks API, and split its responsibilities across just the existing Learning Sequences Outline and Sequence Metadata APIs. This will involve at least a couple of steps.

### Complete rollout of Learning Sequences Outline calls.

We're currently in a transitional state between these APIs where the Learning Sequences Outline calls are only rolled out on a small handful of courses.

### Shift Sequence and Unit metadata to only come from Sequence Metadata API.

We currently pull this information from both Course Blocks and the Sequence Metadata API. We can consolidate on just the Sequence Metadata API. There is also server side optimization that can be done with the Sequence Metadata API calls as part of this work.
