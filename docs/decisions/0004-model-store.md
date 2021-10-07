## Model Store

Because we have a variety of models in this app (course, section, sequence, unit), we use a set of generic 'model store' reducers in redux to manage this data.  Once loaded from the APIs, the data is put into the model store by type and by ID, which allows us to quickly access it in the application.  Furthermore, any sub-trees of model children (like "items" in the sequence metadata API) are flattened out and stored by ID in the model-store, and their arrays replaced by arrays of IDs.  This is a recommended way to store data in redux as documented here:

https://redux.js.org/faq/organizing-state#how-do-i-organize-nested-or-duplicate-data-in-my-state

Different modules of the application maintain individual/lists of IDs that reference data stored in the model store.  These are akin to indices in a database, in that they allow you to quickly extract data from the model store without iteration or filtering.  

A common pattern when loading data from an API endpoint is to use the model-store's redux actions (addModel, updateModel, etc.) to load the "models" themselves into the model store by ID, and then dispatch another action to save references elsewhere in the redux store to the data that was just added.  When adding courses, sequences, etc., to model-store, we also save the courseId and sequenceId in the 'courseware' part of redux.  This means the courseware React Components can extract the data from the model-store quickly by using the courseId as a key: `state.models.courses[state.courseware.courseId]`.  For an array, it iterates once over the ID list in order to extract the models from model-store.  This iteration is done when React components' re-render, and can be done less often through memoization as necessary.
