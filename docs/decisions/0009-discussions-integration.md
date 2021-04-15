# Discussions Integration

The discussions project will ultimately need to embed code from a separate micro-frontend into frontend-app-learning in order to render in-context discussions.  In-context, in this case, means as a sidebar to unit-level content.  The idea is that the frontend-app-discussions MFE would have routes that render unit-specific discussions forum as a companion/sidebar to the main unit content.  

This ADR describes some design considerations for this integration.

This integration is a forerunner to a broader project around the implementation of "experience plugins" which would allow us to load code across micro-frontends without an iframe.  That said, that project hasn't kicked off yet, so in the meantime we'd like to move forward with a simple iframe-based approach, very similar to how we load the unit content from LMS.  

Furthermore, we will need to revisit this if it ever becomes the case that an LTI-based discussions provider implements in-context discussions.  Our approach should ideally be roughly compatible with LTI concepts and techniques, though I'd strongly suggest we _don't_ build anything LTI-specific for the foreseeable future.

The suggested implementation involves:

- Updating the sequence metadata API to include information about whether a particular unit should load in-context discussions.  For now, this could take the form of a `discussions_url` added to the unit objects inside the `items` array.  Longer term we'll want a way to signal to the frontend-app-learning MFE the plugins that should be available on the page, but that likely will come from some other API.  I don't think we should worry about that broader plugin configuration as part of this.
- Adding a new `InContextSidebar` React component to frontend-app-learning to house the discussions integration.  The medium to long-term goal is that discussions will not be the only experience plugin loaded in this sidebar, so it would be appropriate to add a thin layer of abstraction between the components that render the discussions iframe and the components that handle the sidebar's behavior.
- Have the discussions iframe load the page at `discussions_url`
- If necessary, use a postMessage-based API to communicate into the iframe and pass additional data into it.  I don't know of a use-case for this for the discussions project, but wanted to mention it.  The schema of these messages would ideally be LTI-friendly, though the LTI specification doesn't have a lot to say about a postMessage schema.  This document suggests a reasonable message schema: https://github.com/bracken/lti_messaging
