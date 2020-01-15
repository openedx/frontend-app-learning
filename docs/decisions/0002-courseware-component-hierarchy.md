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


This app uses a "model store" - a normalized representation of our API data.  This data is kept in an Object with entity IDs as keys, and the entities as values.  This allows the application to quickly look up data in the map using only a key.  It also means that if the same entity is used in multiple places, there's only one actual representation of it in the client - anyone who wants to use it effectively maintains a reference to it via it's ID.

There are a few kinds of data in the model store.  Information from the blocks API - courses, chapters, sequences, and units - are stored together by ID.  Into this, we merge course, sequence, and unit metadata from the courses and sequence metadata APIs.
