## Model Store

Because we have a variety of models in this app (course, section, sequence, unit), we use a set of generic 'model store' reducers in redux to manage this data.  Once loaded from the APIs, the data is put into the model store by type and by ID, which allows us to quickly access it in the application.  Furthermore, any sub-trees of model children (like "items" in the sequence metadata API) are flattened out and stored by ID in the model-store, and their arrays replaced by arrays of IDs.  This is a recommended way to store data in redux as documented here:

https://redux.js.org/faq/organizing-state#how-do-i-organize-nested-or-duplicate-data-in-my-state

(As an additional data point, djoy has stored data in this format in multiple projects over the years and found it to be very effective)
