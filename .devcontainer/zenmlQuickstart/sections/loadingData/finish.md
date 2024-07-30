# Loading Your Data 📬

Everything looks as we'd expect and the values are all in the right format 🥳.

We're now at the point where can bring this step (and some others) together into a single
pipeline, the top-level organising entity for code in ZenML. Creating such a pipeline is
as simple as adding a `@pipeline` decorator to a function. This specific
pipeline doesn't return a value, but that option is available to you if you need.
