# Tour Structure Decisions

## Compartmentalizing the tour objects
We created the directory `src/tours` in order to organize tours across the MFE. Each tour has its own JSX file where we
define a tour object to be passed to the `<Tour />` component in `<LoadedTabPage />`.

Although each tour is stored in a JSX file, the tour object itself is meant to be an `object` type. Thus, the structure
of each tour object is as follows:
```$xslt
// Note: this is a simplified version of a tour object

const exampleTour = (enabled) => ({
    checkpoints: [],
    enabled,
    tourId: 'exampleTour',
});
```

The reason we use a JSX file rather than a JS file is to allow for use of React components within the objects such as
`<FormattedMessage />`.

## Implementing i18n in tour objects
The `<Tour />` component ingests a single prop called `tours` which expects a list of objects.
Given the structure in which we organized tour objects, there were two considerations in working with i18n:
- You can't injectIntl into something that isn't a React component without considerable adjustments,
so using the familiar `{intl.formatMessage(messages.foo)}` syntax would not be possible.
- You can't return normal objects from a React component, only React elements. I.e. switching these from arrow functions
 to React function based components would not be ideal because the `tours` prop expects objects.

### Decision
We chose to use `<FormattedMessage />` directly within the tour objects. We also created shared `<FormattedMessage />`
components inside of `GenericTourFormattedMessages.jsx` for use across the tours.
