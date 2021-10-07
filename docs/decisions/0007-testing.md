# Testing

## Status
Draft

Let's live with this a bit longer before deciding it's a solid approach and marking this Approved.

## Context
We'd like to all be on the same page about how to approach testing, what is
worth testing, and how to do it.

## React Testing Library
We'll use react-testing-library and jest as the main testing tools.

This has some implications about how to test. You can read the React Testing Library's
[Guiding Principles](https://testing-library.com/docs/guiding-principles), but the main
takeaway is that you should be interacting with React as closely as possible to the way
the user will interact with it.

For example, they discourage using class or element name selectors to find components
during a test. Instead, you should find them by user-oriented attributes like labels,
text, or roles. As a last resort, by a `data-testid` tag.

## Mocking data
We'll use [Rosie](https://github.com/rosiejs/rosie) as a tool for building JavaScript objects.
Our main use case for Rosie is to use factories in order to mock the data we'd like to fetch when rendering components.
[axios-mock-adapter](https://www.npmjs.com/package/axios-mock-adapter) allows us to mock the response of an HTTP request.

For example, we may use a factory to build a course metadata object:

`const courseMetadata = Factory.build('courseMetadata');`

Then we'd pass that `courseMetadata` object into an axios mock call:

`axiosMock.onGet('example.com').reply(200, courseMetadata);`

This way, when a component sends a GET request to `example.com` within the test's lifecycle, the request will be intercepted
by the axios-mock-adapter, and the courseMetadata object will be returned.

These factories should live within the data directories they intend to mock
```
courseware
  | data
      | __factories__
          | courseMetadata.factory.js /* used to define the Rosie factory */
      | api.js /* getCourseMetadata() lives here */
```

## What to Test
We have not found exhaustive unit testing of frontend code to be worth the trouble.
Rather, let's focus on testing non-obvious behavior.

In essence: `test behavior that wouldn't present itself to a developer playing around`.

Practically speaking, this means error states, interactive components, corner cases,
or anything that wouldn't come up in a demo course. Something a developer wouldn't
notice in the normal course of working in devstack.

## Snapshots
In practice, we've found snapshots of component trees to be too brittle to be worth it,
as refactors occur or external libraries change.

They can still be useful for data (like redux tests) or tiny isolated components.

But please avoid for any "interesting" component. Prefer inspecting the explicit behavior
under test, rather than just snapshotting the entire component tree.
