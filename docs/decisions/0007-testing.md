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
