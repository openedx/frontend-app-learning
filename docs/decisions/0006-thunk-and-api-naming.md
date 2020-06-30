# Naming API functions and redux thunks

Because API functions and redux thunks are two parts of a larger process, we've informally settled on some naming conventions for them to help differentiate the type of code we're looking at.

## API Functions

This micro-frontend follows a pattern of naming API functions with a prefix for their HTTP verb.

Examples:

`getCourseBlocks` - The GET request we make to load course blocks data.
`postSequencePosition` - The POST request for saving sequence position.

## Redux Thunks

Meanwhile, we use a different set of verbs for redux thunks to differentiate them from the API functions.  For instance, we use the `fetch` prefix for loading data (primarily via GET requests), and `save` for sending data back to the server (primarily via POST or PATCH requests)

Examples:

`fetchCourse` - The thunk for getting course data across several APIs.
`fetchSequence` - The thunk for the process of retrieving sequence data.
`saveSequencePosition` - Wraps the POST request for sending sequence position back to the server.

The verb prefixes for thunks aren't perfect - but they're a little more 'friendly' and semantically meaningful than the HTTP verbs used for APIs.  So far we have `fetch`, `save`, `check`, `reset`, etc.
