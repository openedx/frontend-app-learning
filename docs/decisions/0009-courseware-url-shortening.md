# Courseware URL shortening

## Status

Accepted

_This updates some of the content in [ADR #8: Liberal courseware path handling](./0008-liberal-courseware-path-handling.md)._

## Context

The current URL is not human-readable. The URL is composed of the UsageKeys for the current sequence and unit. We can't make UsageKeys themselves more readable because they're tied to student state.

This is what the URLs currently look like:

```

https://learning.edx.org/course/course-v1:edX+DemoX.1+2T2019/block-v1:edX+DemoX.1+2T2019+type@sequential+block@e0a61b3d5a2046949e76d12cac5df493/block-v1:edX+DemoX.1+2T2019+type@vertical+block@52dbad5a28e140f291a476f92ce11996

```

After exploring different URL patterns and possible redundancies in the current URL format. The course, run, and organization is stated in every portion of the URL. We also do not need the URL to tell us the type of block since it has been determined that all URLs will follow the path` /course/:courseId/:sequenceId/:unitId`.

## Decision

The courseware URL will format to the following structure:

```

https://learning.edx.org/c/:courseId/:sequenceHash/:unitHash/:sectionSlug/:sequenceSlug/:unitSlug/
```

The fields definition and requirements ar as follows:

* :courseId (required) - same as the previous `courseId`.
* :sequenceHash (required) - a `urlsafe_b64encode` version of the `sequenceId`.
* :unitHash (required) - a `urlsafe_b64encode` version of the `unitId`.
* :sectionSlug (optional) - `display_name` of the current sequence's parent section.
* :sequenceSlug (optional) - `display_name` of the current sequence.
* :unitSlug (optional) - `display_name` of the current unit

## Consequences

If old URLs are not properly routed then the content and those links will no longer be accessible to the user. The old URLs could include, but not limited to, bookmarks and exams.

## Further work

At some point, we may decide to further extend the URL shortening to the entire platform. At the moment, the hashes for the sequences and units are generated when the sequences and units are being called. In the future, it would be better if the hashes would be generated and stored when the sequences and units are originally created. This would require `learning_sequences` to include a class for unit storage, which is not being stored at the moment.
