# Courseware Page Decisions

**See [0009-courseware-api-direction.md](0009-courseware-api-direction.md) for updates!**

## Courseware data loading

Today we have strictly hierarchical courses - a course contains sections, which contain sequences, which contain units, which contain components.

In creating the courseware pages of this app, we needed to choose how often we fetch data from the server.  If we fetch it once and try to get the whole course, including all the data we need in its entire hierarchy, then the request will take 30+ seconds and be a horrible UX.  If we try to fetch too granularly, we risk making hundreds of calls to the LMS, incuring both request overhead and common server-side processing that needs to occur for each of those requests.

Instead, we've chosen to load data via the following:

- The course blocks API (/api/courses/v2/blocks) for getting the overall structure of the course (limited data on the whole hierarchy)
- The course metadata API (/api/courseware/course) for detailed top-level data, such as dates, enrollment status, info for tabs across the top of the page, etc.
- The sequence metadata API (/api/courseware/sequence) for detailed information on a sequence, such as which unit to display, any banner messages, whether or not the sequence has a prerequisite, if it's an exam, etc.
- The xblock endpoint (http://localhost:18000/xblock/:block_id) which renders HTML for an xBlock by ID, used to render Unit contents.  This HTML is loaded into the application via an iFrame.

These APIs aren't perfect for our usage, but they're getting the job done for now.  They weren't built for our purposes and thus load more information than we strictly need, and aren't as performant as we'd like.  Future milestones of the application may rely on new, more performant APIs (possibly BFFs)

## Unit iframing

We determined, as part of our project discovery, that in order to deliver value to users sooner, we would iframe in content of units.  This allowed us to avoid rebuilding the UI for unit/component xblocks in the micro-frontend, which is a daunting task.  It also allows existing custom xblocks to continue to work for now, as they wouldn't have to be re-written.

A future iteration of the project may go back and pull the unit rendering into the MFE.

## Strictly hierarchical courses

We've also made the assumption that courses are strictly hierarchical - a given section, sequence, or unit doesn't have multiple parents.  This is important, as it allows us to navigate the tree in the client in a deterministic way.  If we need to find out who the parent section of a sequence is, there's only one answer to that question.

## Determining which sequences and units to show

The courseware URL scheme:

`/course/:courseId(/:sequenceId(/:unitId))`

Sequence ID and unit ID are optional.

Today, if the URL only specifies the course ID, we need to pick a sequence to show.  We do this by picking the first sequence of the course (as dictated by the course blocks API) and update the URL to match.  _After_ the URL has been updated, the application will attempt to load that sequence.

Similarly, if the URL doesn't contain a unit ID, we use the `position` field of the sequence to determine which unit we want to display from that sequence.  If the position isn't specified in the sequence, we choose the first unit of the sequence.  After determining which unit to display, we update the URL to match.  After the URL is updated, the application will attempt to load that unit via an iFrame.

_This URL scheme has been expanded upon in
[ADR #8: Liberal courseware path handling](./0008-liberal-courseware-path-handling.md)._

## "Container" components vs. display components

This application makes use of a few "container" components at the top level - CoursewareContainer and CourseHomeContainer.

The point of these containers is to introduce a layer of abstraction between the UI representation of the pages and the way their data was loaded, as described above.

We don't want our Course.jsx component to be intimately aware - for example - that it's data is loaded via two separate APIs that are then merged together.  That's not useful information - it just needs to know where it's data is and if it's loaded.  Furthermore, this layer of abstraction lets us normalize field names between the various APIs to let our MFE code be more consistent and readable.  This normalization is done in the src/data/api.js layer.

## Navigation

Course navigation in a hierarchical course happens primarily via the "sequence navigation".  This component lets users navigate to the next and previous unit in the course, and also select specific units within the sequence directly.  The next and previous buttons (SequenceNavigation and UnitNavigation) delegate decision making up the tree to CoursewareContainer.  This is an intentional separation of concerns which should allow different CoursewareContainer-like components to make different decisions about what it means to go to the "next" or "previous" sequence.  This is in support of future course types such as "pathway" courses and adaptive learning sequences.  There is no actual code written for these course types, but it felt like a good separation of concerns.
