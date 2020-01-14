# Courseware app structure

Currently we have hierarchical courses - they contain sections, subsections, units, and components.

We need data to power each level.

We've made decisions that we're going to re-fetch data at the subsection level under the assumption that

At any given level, you have the following structure:

Parent
  Container
    Child
      Context

    The container belongs to the parent module, and is an opportunity for the parent to decide to load more data necessary to load the Child.  If the parent has what it needs, it may not use a Container.  The Child has an props-only interface.  It does _not_ use contexts or redux from the Parent.  The child may decide to use a Context internally if that's convenient, but that's a decision independent of anything above the Child in the hierarchy.
