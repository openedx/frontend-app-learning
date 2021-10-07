# Components Own Their Own Loading State

Currently, the majority of the components in the component tree for both Courseware and CourseHome own their own loading state.  This means that they're _aware_ of the loading status (loading, loaded, failed) of the resources they depend on, and are expected to adjust their own rendering based on that state.

The alternative is for a given component's parent to be responsible for this logic.  Under normal circumstances, if the parents were responsible, it would probably result in simpler code in general.  A component could just take for granted that if it's being rendered, all it's data must be ready.  

*We think that that approach (giving the parents responsibility) isn't appropriate for this application.*

We expect - in the longer term - that different courses/course staff may switch out component implementations.  Use a different form of SequenceNavigation, for instance.  Because of this, we didn't want parent components to be too aware of the nature of their children.  The children are more self-contained this way, though we sacrifice some simplicity for it.

If, for instance, the Sequence component renders a skeleton of the SequenceNavigation, the look of that skeleton is going to be based on an understanding of how the SequenceNavigation renders itself.  If the SequenceNavigation implementation is switched out, that loading code in the Sequence may be wrong/misleading to the user.  If we leave the loading logic in the parent, we then have to branch it for all the types of SequenceNavigations that may exist - this violates the Open/Closed principle by forcing us to update our application when we try to make a new extension/implementation of a sub-component (assuming we have a plugin/extension/component replacement framework in place).

By moving the loading logic into the components themselves, the idea is to allow a given component to render as much of itself as it reasonably can - this may mean just a spinner, or it may mean a "skeleton" UI while the resources are loading.  The parent doesn't need to be aware of the details.

## Under what circumstances would we reverse this decision?

If we find, in time, that we aren't seeing that "switching out component implementations" is a thing that's happening, then we can probably simplify the application code by giving parents the responsibility of deciding when to render their children, rather than keeping that responsibility with the children themselves.  
